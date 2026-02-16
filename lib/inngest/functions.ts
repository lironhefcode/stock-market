import { inngest } from "@/lib/inngest/client"
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts"
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer"
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions"
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"
import { getNews } from "@/lib/actions/finnhub.actions"
import { getFormattedTodayDate } from "@/lib/utils"

export const sendSignUpEmail = inngest.createFunction({ id: "sign-up-email" }, { event: "app/user.created" }, async ({ event, step }) => {
  const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `

  const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}", userProfile)

  const response = await step.ai.infer("generate-welcome-intro", {
    model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
    body: {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    },
  })

  await step.run("send-welcome-email", async () => {
    const part = response.candidates?.[0]?.content?.parts?.[0]
    const introText =
      (part && "text" in part ? part.text : null) || "Thanks for joining CoVest. You now have the tools to track markets and make smarter moves."

    const {
      data: { email, name },
    } = event

    return await sendWelcomeEmail({ email, name, intro: introText })
  })

  return {
    success: true,
    message: "Welcome email sent successfully",
  }
})

const triggers = process.env.VERCEL_ENV === "production" ? [{ event: "app/send.daily.news" }, { cron: "TZ=Asia/Jerusalem 30 22 * * *" }] : [{ event: "app/send.daily.news" }]
export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
    rateLimit: {
      limit: 1,
      period: "1d",
    },
    concurrency: {
      limit: 1,
    },
  },
  triggers,
  async ({ step }) => {
    // Step #1: Get all users for news delivery (deduplicated and validated)
    const users = await step.run("get-all-users", async () => {
      const allUsers = await getAllUsersForNewsEmail()

      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      // Filter out invalid emails and deduplicate
      const validUsers = allUsers.filter((user) => {
        const isValid = emailRegex.test(user.email)
        if (!isValid) {
        }
        return isValid
      })

      const uniqueUsers = Array.from(new Map(validUsers.map((user) => [user.email, user])).values())

      return uniqueUsers
    })

    if (!users || users.length === 0) return { success: false, message: "No users found for news email" }

    // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
    const results = await step.run("fetch-user-news", async () => {
      const perUser: Array<{
        user: UserForNewsEmail
        articles: MarketNewsArticle[]
      }> = []
      for (const user of users as UserForNewsEmail[]) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email)
          let articles = await getNews(symbols)
          // Enforce max 6 articles per user
          articles = (articles || []).slice(0, 6)
          // If still empty, fallback to general
          if (!articles || articles.length === 0) {
            articles = await getNews()
            articles = (articles || []).slice(0, 6)
          }
          perUser.push({ user, articles })
        } catch (e) {
          perUser.push({ user, articles: [] })
        }
      }
      return perUser
    })

    // Step #3: Summarize news and send one email per user (each send is its own
    // idempotent sub-step so Inngest tracks completion per-recipient on retries)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const seen = new Set<string>()

    for (const { user, articles } of results) {
      // Skip invalid or duplicate emails before creating a step
      if (!emailRegex.test(user.email) || seen.has(user.email)) continue
      seen.add(user.email)

      const aiResponse = await step.ai.infer(`summarize-news:${user.email}`, {
        model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
        body: {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: NEWS_SUMMARY_EMAIL_PROMPT.replace(
                    "{{newsData}}",
                    JSON.stringify(
                      articles.map((a) => ({
                        headline: a.headline,
                        summary: a.summary,
                        source: a.source,
                        url: a.url,
                        category: a.category,
                        related: a.related,
                      })),
                    ),
                  ),
                },
              ],
            },
          ],
        },
      })

      await step.run(`send-news-email:${user.email}`, async () => {
        const part = aiResponse.candidates?.[0]?.content?.parts?.[0]
        const newsContent =
          (part && "text" in part ? part.text : null) ||
          articles
            .map(
              (article, i) => `
              <div style="margin-bottom: 24px; padding: 20px; background-color: #212328; border-radius: 8px; border-left: 3px solid #FDD458;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #ffffff; line-height: 1.4;">
                  ${i + 1}. ${article.headline}
                </h3>
                ${article.summary ? `<p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">${article.summary}</p>` : ""}
                ${article.url ? `<a href="${article.url}" style="display: inline-block; margin-top: 10px; font-size: 13px; color: #FDD458; text-decoration: none;">Read more &rarr;</a>` : ""}
              </div>`,
            )
            .join("")

        await sendNewsSummaryEmail({
          email: user.email,
          date: getFormattedTodayDate(),
          newsContent,
        })

        return { email: user.email, sent: true }
      })
    }

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    }
  },
)

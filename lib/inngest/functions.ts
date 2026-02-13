import { inngest } from "@/lib/inngest/client"
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts"
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer"
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions"
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"
import { getNews } from "@/lib/actions/finnhub.actions"
import { getFormattedTodayDate } from "@/lib/utils"

export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
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
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining CoVest. You now have the tools to track markets and make smarter moves."

      const {
        data: { email, name },
      } = event

      return await sendWelcomeEmail({ email, name, intro: introText })
    })

    return {
      success: true,
      message: "Welcome email sent successfully",
    }
  }
)

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
    concurrency: {
      limit: 1, // Ensure only one instance runs at a time
    },
  },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
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
          console.log(`Skipping invalid email: ${user.email}`)
        }
        return isValid
      })
      
      const uniqueUsers = Array.from(
        new Map(validUsers.map((user) => [user.email, user])).values()
      )
      
      console.log(`Found ${allUsers.length} users, ${validUsers.length} valid emails, ${uniqueUsers.length} unique`)
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
          console.error("daily-news: error preparing user news", user.email, e)
          perUser.push({ user, articles: [] })
        }
      }
      return perUser
    })

    // Step #3: Summarize news via AI and send emails
    await step.run("summarize-and-send-emails", async () => {
      const emailsSent: string[] = []
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      for (const { user, articles } of results) {
        try {
          // Skip if email is invalid
          if (!emailRegex.test(user.email)) {
            console.log(`Skipping invalid email: ${user.email}`)
            continue
          }

          // Skip if we already sent to this email
          if (emailsSent.includes(user.email)) {
            console.log(`Skipping duplicate email to ${user.email}`)
            continue
          }

          const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace("{{newsData}}", JSON.stringify(articles, null, 2))

          // Note: We're generating summary without AI for now to avoid nested steps
          // TODO: Move AI summarization outside step.run if needed
          const newsContent = `Here's your daily market news summary:\n\n${articles
            .map((article, i) => `${i + 1}. ${article.headline}\n   ${article.summary || ""}`)
            .join("\n\n")}`

          // Send email
          await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          })

          emailsSent.push(user.email)
          console.log(`Email sent to ${user.email}`)
        } catch (e) {
          console.error("Failed to process news for : ", user.email, e)
        }
      }

      return { emailsSent: emailsSent.length }
    })

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    }
  }
)

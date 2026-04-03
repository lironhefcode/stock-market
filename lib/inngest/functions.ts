import { inngest } from "@/lib/inngest/client"
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts"
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer"
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions"
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"
import { getNews, getStockChange } from "@/lib/actions/finnhub.actions"
import { getFormattedTodayDate } from "@/lib/utils"
import { Alert } from "@/db/models/alert"
import { PushSubscription } from "@/db/models/push-subscription"
import { connectToDatabase } from "@/db/mongoose"
import { sendPushNotification } from "@/lib/web-push"

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

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
    concurrency: {
      limit: 1,
    },
  },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  async ({ step }) => {
    // Runtime guard: only the Vercel production deployment should send emails.
    // This prevents duplicate emails from Inngest branch environments.
    const vercelEnv = process.env.VERCEL_ENV
    if (vercelEnv && vercelEnv !== "production") {
      return { success: false, message: `Skipped: VERCEL_ENV is "${vercelEnv}", not "production"` }
    }

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
          console.error("Error fetching user news:", e)
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

export const checkPriceAlerts = inngest.createFunction(
  {
    id: "check-price-alerts",
    concurrency: { limit: 1 },
  },
  [{ cron: "*/2 * * * *" }],
  async ({ step }) => {
    const activeAlerts = await step.run("fetch-active-alerts", async () => {
      await connectToDatabase()
      const alerts = await Alert.find({ status: "active" }).lean()
      return alerts.map((a) => ({
        id: String(a._id),
        symbol: a.symbol,
        alertType: a.alertType,
        threshold: a.threshold,
      }))
    })

    if (!activeAlerts || activeAlerts.length === 0) {
      return { success: true, message: "No active alerts to check", triggered: 0 }
    }

    const uniqueSymbols = [...new Set(activeAlerts.map((a) => a.symbol))]

    const quotes = await step.run("fetch-quotes", async () => {
      const data = await getStockChange(uniqueSymbols)
      const result: Record<string, number> = {}
      for (const [symbol, quote] of Object.entries(data)) {
        if (quote?.c != null) result[symbol] = quote.c
      }
      return result
    })

    const triggeredAlertDetails = await step.run("evaluate-and-trigger", async () => {
      await connectToDatabase()
      const now = new Date()
      const triggered: Array<{
        id: string
        userId: string
        symbol: string
        alertName: string
        alertType: string
        threshold: number
        price: number
      }> = []

      for (const alert of activeAlerts) {
        const price = quotes[alert.symbol]
        if (price == null) continue

        const shouldTrigger = (alert.alertType === "upper" && price >= alert.threshold) || (alert.alertType === "lower" && price <= alert.threshold)

        if (shouldTrigger) {
          await Alert.updateOne({ _id: alert.id, status: "active" }, { $set: { status: "triggered", triggeredAt: now, lastCheckedPrice: price } })
          const fullAlert = await Alert.findById(alert.id).lean()
          if (fullAlert) {
            triggered.push({
              id: alert.id,
              userId: String(fullAlert.userId),
              symbol: alert.symbol,
              alertName: String(fullAlert.alertName),
              alertType: alert.alertType,
              threshold: alert.threshold,
              price,
            })
          }
        } else {
          await Alert.updateOne({ _id: alert.id }, { $set: { lastCheckedPrice: price } })
        }
      }

      return triggered
    })

    if (triggeredAlertDetails.length > 0) {
      await step.run("send-push-notifications", async () => {
        await connectToDatabase()

        const userIds = [...new Set(triggeredAlertDetails.map((a) => a.userId))]
        const subscriptions = await PushSubscription.find({ userId: { $in: userIds } }).lean()

        const subsByUser = new Map<string, Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>>()
        for (const sub of subscriptions) {
          const list = subsByUser.get(sub.userId) || []
          list.push({ endpoint: sub.endpoint, keys: sub.keys })
          subsByUser.set(sub.userId, list)
        }

        const expiredEndpoints: string[] = []

        for (const alert of triggeredAlertDetails) {
          const userSubs = subsByUser.get(alert.userId)
          if (!userSubs || userSubs.length === 0) continue

          const direction = alert.alertType === "upper" ? "above" : "below"
          const payload = {
            title: `${alert.symbol} alert triggered`,
            body: `${alert.alertName} crossed ${direction} $${alert.threshold.toFixed(2)}. Current price: $${alert.price.toFixed(2)}.`,
            url: "/",
            icon: "/assets/icons/web-app-manifest-192x192.png",
            badge: "/assets/icons/web-app-manifest-192x192.png",
          }

          for (const sub of userSubs) {
            const result = await sendPushNotification(sub, payload)
            if (!result.success && result.expired) {
              expiredEndpoints.push(sub.endpoint)
            }
          }
        }

        if (expiredEndpoints.length > 0) {
          await PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } })
        }
      })
    }

    return { success: true, message: `Alert check complete`, triggered: triggeredAlertDetails.length }
  },
)

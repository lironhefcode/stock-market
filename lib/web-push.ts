import webpush from "web-push"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || `mailto:${process.env.NODEMAILER_EMAIL}`

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

type PushPayload = {
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
}

type PushTarget = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function sendPushNotification(subscription: PushTarget, payload: PushPayload) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 },
    )
    return { success: true }
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (statusCode === 404 || statusCode === 410) {
      return { success: false, expired: true }
    }
    console.error("Web push send failed:", error)
    return { success: false, expired: false }
  }
}

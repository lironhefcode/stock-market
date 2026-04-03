"use server"

import { PushSubscription } from "@/db/models/push-subscription"
import { connectToDatabase } from "@/db/mongoose"
import { getSession } from "./auth.actions"

type SubscriptionPayload = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function savePushSubscription(sub: SubscriptionPayload) {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return { success: false, message: "Not authenticated" }
    }

    const userId = res.session.user.id

    await PushSubscription.findOneAndUpdate(
      { userId, endpoint: sub.endpoint },
      { $set: { keys: sub.keys, userId, endpoint: sub.endpoint } },
      { upsert: true, new: true },
    )

    return { success: true }
  } catch (error) {
    console.error("Error saving push subscription:", error)
    return { success: false, message: "Failed to save subscription" }
  }
}

export async function removePushSubscription(endpoint: string) {
  try {
    await connectToDatabase()
    const res = await getSession()
    if (!res.success || !res.session?.user) {
      return { success: false, message: "Not authenticated" }
    }

    await PushSubscription.deleteOne({ userId: res.session.user.id, endpoint })

    return { success: true }
  } catch (error) {
    console.error("Error removing push subscription:", error)
    return { success: false, message: "Failed to remove subscription" }
  }
}

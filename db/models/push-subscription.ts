import { Schema, model, models, Document } from "mongoose"

export interface PushSubscriptionDocument extends Document {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: Date
}

const pushSubscriptionSchema = new Schema<PushSubscriptionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
)

pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true })

export const PushSubscription =
  models?.PushSubscription || model<PushSubscriptionDocument>("PushSubscription", pushSubscriptionSchema)

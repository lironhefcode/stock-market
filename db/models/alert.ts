import { Schema, model, models, Document } from "mongoose"

export interface AlertDocument extends Document {
  userId: string
  symbol: string
  company: string
  alertName: string
  alertType: "upper" | "lower"
  threshold: number
  status: "active" | "triggered" | "dismissed"
  lastCheckedPrice?: number
  triggeredAt?: Date
  createdAt: Date
}

const alertSchema = new Schema<AlertDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    alertName: {
      type: String,
      required: true,
      trim: true,
    },
    alertType: {
      type: String,
      required: true,
      enum: ["upper", "lower"],
    },
    threshold: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "triggered", "dismissed"],
      default: "active",
    },
    lastCheckedPrice: {
      type: Number,
    },
    triggeredAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
)

alertSchema.index({ userId: 1, status: 1 })
alertSchema.index({ status: 1 })

export const Alert = models?.Alert || model<AlertDocument>("Alert", alertSchema)

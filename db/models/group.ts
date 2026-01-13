import { Schema, model, models, Document } from "mongoose"

export interface GroupDocument extends Document {
  name: string
  inviteCode: string
  creatorId: string
  createdAt: Date
}

const groupSchema = new Schema<GroupDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    creatorId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
)

groupSchema.index({ inviteCode: 1 }, { unique: true })

export const Group = models?.Group || model<GroupDocument>("Group", groupSchema)

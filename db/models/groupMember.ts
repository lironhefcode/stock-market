import { Schema, model, models, Document, Types } from "mongoose"

export interface StockPosition {
  symbol: string
  amountInvested: number
}

export interface GroupMemberDocument extends Document {
  groupId: Types.ObjectId
  userId: string
  username: string
  positions: StockPosition[]
  joinedAt: Date
}

const stockPositionSchema = new Schema<StockPosition>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    amountInvested: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const groupMemberSchema = new Schema<GroupMemberDocument>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    positions: {
      type: [stockPositionSchema],
      required: true,
      validate: {
        validator: (positions: StockPosition[]) => positions.length > 0,
        message: "At least one stock position is required",
      },
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
)

groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true })

export const GroupMember = models?.GroupMember || model<GroupMemberDocument>("GroupMember", groupMemberSchema)

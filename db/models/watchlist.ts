import { Schema, model, models, Document } from "mongoose"

export interface WatchlistItem extends Document {
  userId: string
  symbol: string
  addedAt: Date
}

const watchlistSchema = new Schema<WatchlistItem>(
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
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
)

// Compound index: user can't add the same stock twice
watchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true })

export const Watchlist = models?.Watchlist || model<WatchlistItem>("Watchlist", watchlistSchema)

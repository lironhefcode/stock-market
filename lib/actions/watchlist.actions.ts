"use server"

import { Watchlist } from "@/db/models/watchlist"
import { WatchlistItem } from "@/db/models/watchlist"
import { connectToDatabase } from "@/db/mongoose"

export async function getWatchlistSymbolsByEmail(
  email: string,
  returnFullData?: boolean
): Promise<string[] | WatchlistItem[]> {
  try {
    const mongoose = await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Database connection not established")
    }

    const user = await db.collection("user").findOne<{ _id?: unknown; id?: unknown; emai?: string }>({
      email: email,
    })
    if (!user) {
      return []
    }
    const userId = (user.id as string) || user._id?.toString()
    if (!userId) {
      return []
    }

    if (returnFullData) {
      const watchlistItems = await Watchlist.find({ userId: userId }).lean()
      return watchlistItems.map((item) => ({
        userId: String(item.userId),
        symbol: String(item.symbol),
        company: String(item.company),
        addedAt: item.addedAt,
      })) as WatchlistItem[]
    } else {
      const watchlistItems = await Watchlist.find({ userId: userId }, { symbol: 1 }).lean()
      return watchlistItems.map((item) => String(item.symbol))
    }
  } catch (error) {
    console.error("Error fetching watchlist symbols:", error)
    return []
  }
}
export async function addToWatchlist(symbol: string, company: string, userId: string) {
  try {
    const mongoose = await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Database connection not established")
    }
    const watchlistItem = await Watchlist.create({ userId: userId, symbol: symbol, company: company })
    return { success: true, message: "added succsesfullt" }
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    return { success: false, message: "Failed to add to watchlist" }
  }
}

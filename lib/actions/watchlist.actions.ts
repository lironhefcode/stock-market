"use server"

import { Watchlist } from "@/db/models/watchlist"
import { WatchlistItem } from "@/db/models/watchlist"
import { connectToDatabase } from "@/db/mongoose"
import { getSession } from "./auth.actions"
export async function getUserWatchlist() {
  try {
    const mongoose = await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Database connection not established")
    }

    const res = await getSession()
    if (!res.success) {
      throw new Error("no user connection  established")
    }
    const { user } = res!.session!

    const watchlistItems = await Watchlist.find({ userId: user.id }, { symbol: 1 }).lean()
    return watchlistItems.map((item) => String(item.symbol))
  } catch (error) {
    return []
  }
}
export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
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

    const watchlistItems = await Watchlist.find({ userId: userId }, { symbol: 1 }).lean()
    return watchlistItems.map((item) => String(item.symbol))
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

export async function removeFromWatchlist(symbol: string, userId: string) {
  try {
    const mongoose = await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Database connection not established")
    }
    const result = await Watchlist.deleteOne({ userId: userId, symbol: symbol })
    if (result.deletedCount === 0) {
      return { success: false, message: "Item not found in watchlist" }
    }
    return { success: true, message: "Removed from watchlist successfully" }
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    return { success: false, message: "Failed to remove from watchlist" }
  }
}

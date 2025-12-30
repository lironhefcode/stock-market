"use server";

import { Watchlist } from "@/db/models/watchlist";
import { connectToDatabase } from "@/db/mongoose";
import { symbol } from "better-auth";

export async function getWatchlistSymbolsByEmail(
  email: string
): Promise<string[]> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const user = await db
      .collection("users")
      .findOne<{ _id?: unknown; id?: unknown; emai?: string }>({
        email: email,
      });
    if (!user) {
      return [];
    }
    const userId = (user.id as string) || user._id?.toString();
    if (!userId) {
      return [];
    }
    const watchlistItems = await Watchlist.find(
      { userId: userId },
      { symbol: 1 }
    ).lean();
    return watchlistItems.map((item) => String(item.symbol));
  } catch (error) {
    console.error("Error fetching watchlist symbols:", error);
    return [];
  }
}

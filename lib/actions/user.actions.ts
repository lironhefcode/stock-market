"use server";

import { connectToDatabase } from "@/db/mongoose";
import { count } from "console";

export const getAllUsersForNewsEmail = async (): Promise<
  UserForNewsEmail[]
> => {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection not established");
      throw new Error("Database connection not established");
      return [];
    }
    const user = await db
      .collection("user")
      .find(
        { email: { $exists: true, $ne: null } },
        { projection: { email: 1, name: 1, id: 1, _id: 1, country: 1 } }
      )
      .toArray();
    return user
      .filter((user) => user.email && user.name)
      .map((user) => ({
        id: user.id || user._id?.toString() || "",
        email: user.email,
        name: user.name,
        country: user.country || "Not specified",
      }));
  } catch (error) {
    console.error("Error fetching users for news email:", error);
    return [];
  }
};

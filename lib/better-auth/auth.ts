import { connectToDatabase } from "@/db/mongoose"
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"
type MongoDbParam = Parameters<typeof mongodbAdapter>[0]
const createAuth = (db: MongoDbParam) =>
  betterAuth({
    database: mongodbAdapter(db),
    user: {
      additionalFields: {
        receiveDailyEmails: {
          type: "boolean",
          defaultValue: true,
        },
        showInvestmentToGroup: {
          type: "boolean",
          defaultValue: true,
        },
        country: {
          type: "string",
          defaultValue: "Not specified",
        },
        investmentGoals: {
          type: "string",
          defaultValue: "Not specified",
        },
        riskTolerance: {
          type: "string",
          defaultValue: "Not specified",
        },
        preferredIndustry: {
          type: "string",
          defaultValue: "Not specified",
        },
      },
    },
    secret: process.env.BETTER_AUTH_SECRET || "",
    cookies: nextCookies(),
    baseUrl: process.env.BETTER_AUTH_URL || "",
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: false,
      minPasswordLength: 6,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    plugins: [nextCookies()],
  })

let authInstance: ReturnType<typeof createAuth> | null = null
export const getAuth = async () => {
  if (authInstance) {
    return authInstance
  }
  const mongoose = await connectToDatabase()
  const db = mongoose.connection.db
  if (!db) {
    throw new Error("Database connection is not established")
  }
  authInstance = createAuth(db)
  return authInstance
}
export const auth = await getAuth()
export type Auth = typeof auth

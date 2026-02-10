"use server"

import { redirect } from "next/navigation"
import { auth } from "../better-auth/auth"
import { inngest } from "../inngest/client"
import { headers } from "next/headers"

export const singUpWithEmail = async ({ email, password, country, fullName, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: fullName,
      },
    })
    if (res) {
      inngest.send({
        name: "app/user.created",
        data: {
          email: email,
          name: fullName,
          country: country,
          investmentGoals: investmentGoals,
          riskTolerance: riskTolerance,
          preferredIndustry: preferredIndustry,
        },
      })
    }
    return { success: true, data: res }
  } catch (error) {
    console.error("Sign-up error:", error)
    return { success: false, error: "Sign-up failed" }
  }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
  try {
    const res = await auth.api.signInEmail({
      body: {
        email: email,
        password: password,
      },
    })
    return { success: true, data: res }
  } catch (error) {
    console.error("Sign-in error:", error)
    return { success: false, error: "Sign-in failed" }
  }
}
export const signOut = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
    return { success: true }
  } catch (error) {
    console.error("Sign-out error:", error)
    return { success: false, error: "Sign-out failed" }
  }
}

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return { success: true, session }
  } catch (error) {
    console.error("Error getting session:", error)
    return { success: false, error: "Failed to get session" }
  }
}
export async function getUser(): Promise<User> {
  let session

  try {
    session = await getSession()
  } catch (error) {
    console.error("Failed to get session:", error)
    throw error // real failure → error boundary
  }

  if (!session.success || !session.session?.user) {
    redirect("/sign-in")
  }

  return session.session.user
}

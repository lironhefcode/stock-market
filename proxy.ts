import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { getSession } from "@/lib/actions/auth.actions"
import { auth } from "@/lib/better-auth/auth"

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const sessionCookie = getSessionCookie(request)

  // Check cookie presence - prevents obviously unauthorized users
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Check if session exists and has a user
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|assets).*)"],
}

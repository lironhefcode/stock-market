import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { getSession } from "@/lib/actions/auth.actions"

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  // Check cookie presence - prevents obviously unauthorized users
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }
  const session = await getSession()
  if (!session.success || !session.session?.user) {
    // Session is invalid or expired → redirect
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|assets).*)"],
}

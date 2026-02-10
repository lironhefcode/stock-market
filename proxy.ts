import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { auth } from "@/lib/better-auth/auth"

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const joinCode = request.nextUrl.searchParams.get("inviteCode")

  // If user has an inviteCode but isn't authenticated, save it in a cookie and redirect to sign-in
  if (joinCode && !sessionCookie) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url))
    response.cookies.set("joinCode", joinCode, {
      path: "/",
      maxAge: 60 * 60, // 1 hour
      httpOnly: false, // needs to be readable by client-side JS after auth
      sameSite: "lax",
    })
    return response
  }

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

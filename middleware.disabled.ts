import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@/lib/auth-edge"
import { UserRole } from "@prisma/client"

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Public routes - allow access without authentication
  if (path.startsWith("/auth") || path === "/") {
    return NextResponse.next()
  }

  // Skip middleware for API routes (they handle their own auth)
  if (path.startsWith("/api")) {
    return NextResponse.next()
  }

  // Get session using NextAuth v5 auth function (dynamically imported)
  const auth = await getAuth()
  const session = await auth()

  // If no session, redirect to sign in
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Role-based route protection
  const role = session.user?.role as UserRole

  // Admin routes
  if (path.startsWith("/admin")) {
    if (role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // HOD routes
  if (path.startsWith("/hod")) {
    if (role !== UserRole.HOD && role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Class Advisor routes
  if (path.startsWith("/advisor")) {
    if (role !== UserRole.CLASS_ADVISOR && role !== UserRole.ADMIN && role !== UserRole.HOD) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Student routes
  if (path.startsWith("/student")) {
    if (role !== UserRole.STUDENT && role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/hod/:path*",
    "/advisor/:path*",
    "/student/:path*",
    "/dashboard/:path*"
    // Note: API routes are excluded - they handle their own authentication
  ]
}


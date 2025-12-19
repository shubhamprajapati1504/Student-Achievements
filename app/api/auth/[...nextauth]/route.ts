import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import type { NextRequest } from "next/server"

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

export async function GET(request: NextRequest) {
  try {
    return await handlers.GET(request)
  } catch (error) {
    console.error("NextAuth GET error:", error)
    return new Response(
      JSON.stringify({ error: "Authentication error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handlers.POST(request)
  } catch (error) {
    console.error("NextAuth POST error:", error)
    return new Response(
      JSON.stringify({ error: "Authentication error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

// Force Node.js runtime (required for bcryptjs and Prisma)
export const runtime = 'nodejs'


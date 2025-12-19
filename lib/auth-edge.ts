// Edge-compatible auth utility
// This file can be safely imported in Edge runtime (middleware)
// It dynamically imports the auth function only when needed

export async function getAuth() {
  // Dynamic import to avoid loading Node.js modules in Edge runtime
  const { auth } = await import("@/app/api/auth/[...nextauth]/route")
  return auth
}


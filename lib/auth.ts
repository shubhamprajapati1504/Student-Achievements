import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole } from "@prisma/client"

// Lazy-load Node.js dependencies to avoid Edge runtime issues
// These will only be imported when authorize is called (in Node.js runtime)
const getPrisma = async () => {
  const { prisma } = await import("./prisma")
  return prisma
}

// Removed getBcrypt - using inline import in authorize function

export const authOptions: NextAuthConfig = {
  trustHost: true, // Required for NextAuth v5
  // Note: Adapter removed since we're using JWT strategy
  // If you need database sessions later, you'll need to handle adapter differently
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        // Lazy-load prisma and bcrypt only when needed (in Node.js runtime)
        const prisma = await getPrisma()
        const bcryptModule = await import("bcryptjs")
        const bcrypt = bcryptModule.default || bcryptModule

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          studentId: user.studentId,
          departmentId: user.departmentId,
          programId: user.programId,
          academicStructureId: user.academicStructureId,
          divisionId: user.divisionId,
          batchId: user.batchId,
          assignedDepartmentId: user.assignedDepartmentId,
          assignedProgramId: user.assignedProgramId,
          assignedAcademicStructureId: user.assignedAcademicStructureId,
          assignedDivisionId: user.assignedDivisionId,
          assignedBatchId: user.assignedBatchId,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.studentId = user.studentId
        token.departmentId = user.departmentId
        token.programId = user.programId
        token.academicStructureId = user.academicStructureId
        token.divisionId = user.divisionId
        token.batchId = user.batchId
        token.assignedDepartmentId = user.assignedDepartmentId
        token.assignedProgramId = user.assignedProgramId
        token.assignedAcademicStructureId = user.assignedAcademicStructureId
        token.assignedDivisionId = user.assignedDivisionId
        token.assignedBatchId = user.assignedBatchId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.studentId = token.studentId as string | null
        session.user.departmentId = token.departmentId as string | null
        session.user.programId = token.programId as string | null
        session.user.academicStructureId = token.academicStructureId as string | null
        session.user.divisionId = token.divisionId as string | null
        session.user.batchId = token.batchId as string | null
        session.user.assignedDepartmentId = token.assignedDepartmentId as string | null
        session.user.assignedProgramId = token.assignedProgramId as string | null
        session.user.assignedAcademicStructureId = token.assignedAcademicStructureId as string | null
        session.user.assignedDivisionId = token.assignedDivisionId as string | null
        session.user.assignedBatchId = token.assignedBatchId as string | null
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
}


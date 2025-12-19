import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"
import bcrypt from "bcryptjs"

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  programId: z.string().optional(),
  academicStructureId: z.string().optional(),
  divisionId: z.string().optional(),
  batchId: z.string().optional(),
  assignedDepartmentId: z.string().optional(),
  assignedProgramId: z.string().optional(),
  assignedAcademicStructureId: z.string().optional(),
  assignedDivisionId: z.string().optional(),
  assignedBatchId: z.string().optional(),
})

// GET all users
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const departmentId = searchParams.get("departmentId")

    const where: any = {}
    if (role) where.role = role
    if (departmentId) where.departmentId = departmentId

    const users = await prisma.user.findMany({
      where,
      include: {
        department: true,
        program: true,
        academicStructure: true,
        division: true,
        batch: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Remove password from response
    const usersWithoutPassword = users.map(({ password, ...user }) => user)

    return NextResponse.json(usersWithoutPassword)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST create user
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = userSchema.parse(body)

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        phone: true,
        departmentId: true,
        programId: true,
        academicStructureId: true,
        divisionId: true,
        batchId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"

const academicStructureSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(10),
  level: z.number().int().positive(),
  isSemester: z.boolean().default(false),
  semester: z.number().int().positive().optional(),
  departmentId: z.string().min(1),
  programId: z.string().min(1),
})

// GET all academic structures
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("departmentId")
    const programId = searchParams.get("programId")

    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (programId) where.programId = programId

    const academicStructures = await prisma.academicStructure.findMany({
      where,
      include: {
        department: true,
        program: true,
        divisions: {
          include: {
            batches: true,
          },
        },
      },
      orderBy: {
        level: "asc",
      },
    })

    return NextResponse.json(academicStructures)
  } catch (error) {
    console.error("Error fetching academic structures:", error)
    return NextResponse.json(
      { error: "Failed to fetch academic structures" },
      { status: 500 }
    )
  }
}

// POST create academic structure
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = academicStructureSchema.parse(body)

    const academicStructure = await prisma.academicStructure.create({
      data,
      include: {
        department: true,
        program: true,
      },
    })

    return NextResponse.json(academicStructure, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error creating academic structure:", error)
    return NextResponse.json(
      { error: "Failed to create academic structure" },
      { status: 500 }
    )
  }
}


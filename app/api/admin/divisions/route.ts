import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"

const divisionSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(10),
  academicStructureId: z.string().min(1),
})

// GET all divisions
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const academicStructureId = searchParams.get("academicStructureId")

    const where = academicStructureId ? { academicStructureId } : {}

    const divisions = await prisma.division.findMany({
      where,
      include: {
        academicStructure: {
          include: {
            department: true,
            program: true,
          },
        },
        batches: true,
      },
      orderBy: {
        code: "asc",
      },
    })

    return NextResponse.json(divisions)
  } catch (error) {
    console.error("Error fetching divisions:", error)
    return NextResponse.json(
      { error: "Failed to fetch divisions" },
      { status: 500 }
    )
  }
}

// POST create division
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = divisionSchema.parse(body)

    const division = await prisma.division.create({
      data,
      include: {
        academicStructure: true,
      },
    })

    return NextResponse.json(division, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error creating division:", error)
    return NextResponse.json(
      { error: "Failed to create division" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"

const batchSchema = z.object({
  name: z.string().min(1),
  number: z.number().int().positive(),
  divisionId: z.string().min(1),
})

// GET all batches
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const divisionId = searchParams.get("divisionId")

    const where = divisionId ? { divisionId } : {}

    const batches = await prisma.batch.findMany({
      where,
      include: {
        division: {
          include: {
            academicStructure: {
              include: {
                department: true,
                program: true,
              },
            },
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error("Error fetching batches:", error)
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    )
  }
}

// POST create batch
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = batchSchema.parse(body)

    const batch = await prisma.batch.create({
      data,
      include: {
        division: true,
      },
    })

    return NextResponse.json(batch, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating batch:", error)
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"

const departmentSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).max(10).optional(),
  description: z.string().optional(),
})

// GET single department
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        programs: {
          include: {
            academicStructures: {
              include: {
                divisions: {
                  include: {
                    batches: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error("Error fetching department:", error)
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    )
  }
}

// PUT update department
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = departmentSchema.parse(body)

    const department = await prisma.department.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(department)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error updating department:", error)
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    )
  }
}

// DELETE department
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.department.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error("Error deleting department:", error)
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    )
  }
}


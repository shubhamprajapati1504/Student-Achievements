import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole, AchievementCategory } from "@prisma/client"
import { z } from "zod"

const achievementUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.nativeEnum(AchievementCategory).optional(),
  eventDate: z.string().transform((str) => new Date(str)).optional(),
  academicYear: z.string().optional(),
  semester: z.string().optional(),
  certificatePath: z.string().optional(),
  photoPath: z.string().optional(),
  isGroupAchievement: z.boolean().optional(),
  groupMembers: z.string().optional(),
})

// GET single achievement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const achievement = await prisma.achievement.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
            program: true,
            academicStructure: true,
            division: true,
            batch: true,
          },
        },
      },
    })

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      )
    }

    // Check access: Student can only view their own, others can view if they have permission
    if (session.user.role === UserRole.STUDENT && achievement.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(achievement)
  } catch (error) {
    console.error("Error fetching achievement:", error)
    return NextResponse.json(
      { error: "Failed to fetch achievement" },
      { status: 500 }
    )
  }
}

// PUT update achievement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const achievement = await prisma.achievement.findUnique({
      where: { id: params.id },
    })

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      )
    }

    if (achievement.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Can only edit if status is SUBMITTED
    if (achievement.status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "Cannot edit verified or rejected achievements" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = achievementUpdateSchema.parse(body)

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category
    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate
    if (data.academicYear !== undefined) updateData.academicYear = data.academicYear
    if (data.semester !== undefined) updateData.semester = data.semester
    if (data.certificatePath !== undefined) updateData.certificatePath = data.certificatePath
    if (data.photoPath !== undefined) updateData.photoPath = data.photoPath
    if (data.isGroupAchievement !== undefined) updateData.isGroupAchievement = data.isGroupAchievement
    if (data.groupMembers !== undefined) updateData.groupMembers = data.groupMembers

    const updatedAchievement = await prisma.achievement.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedAchievement)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error updating achievement:", error)
    return NextResponse.json(
      { error: "Failed to update achievement" },
      { status: 500 }
    )
  }
}

// DELETE achievement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const achievement = await prisma.achievement.findUnique({
      where: { id: params.id },
    })

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      )
    }

    if (achievement.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Can only delete if status is SUBMITTED
    if (achievement.status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "Cannot delete verified or rejected achievements" },
        { status: 400 }
      )
    }

    await prisma.achievement.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Achievement deleted successfully" })
  } catch (error) {
    console.error("Error deleting achievement:", error)
    return NextResponse.json(
      { error: "Failed to delete achievement" },
      { status: 500 }
    )
  }
}


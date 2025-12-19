import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole, AchievementStatus } from "@prisma/client"
import { z } from "zod"

const verifySchema = z.object({
  status: z.nativeEnum(AchievementStatus),
  remarks: z.string().optional(),
})

// POST verify/reject achievement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== UserRole.CLASS_ADVISOR && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const achievement = await prisma.achievement.findUnique({
      where: { id: params.id },
      include: {
        student: true,
      },
    })

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      )
    }

    // Check if advisor has access to this student
    if (session.user.role === UserRole.CLASS_ADVISOR) {
      if (session.user.assignedDepartmentId && achievement.student.departmentId !== session.user.assignedDepartmentId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (session.user.assignedProgramId && achievement.student.programId !== session.user.assignedProgramId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (session.user.assignedAcademicStructureId && achievement.student.academicStructureId !== session.user.assignedAcademicStructureId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (session.user.assignedDivisionId && achievement.student.divisionId !== session.user.assignedDivisionId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (session.user.assignedBatchId && achievement.student.batchId !== session.user.assignedBatchId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const body = await request.json()
    const data = verifySchema.parse(body)

    const updatedAchievement = await prisma.achievement.update({
      where: { id: params.id },
      data: {
        status: data.status,
        remarks: data.remarks,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
      },
    })

    return NextResponse.json(updatedAchievement)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error verifying achievement:", error)
    return NextResponse.json(
      { error: "Failed to verify achievement" },
      { status: 500 }
    )
  }
}


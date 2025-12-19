import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole, AchievementStatus } from "@prisma/client"

// GET achievements for class advisor's assigned students
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== UserRole.CLASS_ADVISOR && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const academicYear = searchParams.get("academicYear")
    const category = searchParams.get("category")

    // Build where clause based on advisor's assignments
    const where: any = {
      student: {},
    }

    if (session.user.assignedDepartmentId) {
      where.student.departmentId = session.user.assignedDepartmentId
    }
    if (session.user.assignedProgramId) {
      where.student.programId = session.user.assignedProgramId
    }
    if (session.user.assignedAcademicStructureId) {
      where.student.academicStructureId = session.user.assignedAcademicStructureId
    }
    if (session.user.assignedDivisionId) {
      where.student.divisionId = session.user.assignedDivisionId
    }
    if (session.user.assignedBatchId) {
      where.student.batchId = session.user.assignedBatchId
    }

    if (status) where.status = status
    if (academicYear) where.academicYear = academicYear
    if (category) where.category = category

    const achievements = await prisma.achievement.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    )
  }
}


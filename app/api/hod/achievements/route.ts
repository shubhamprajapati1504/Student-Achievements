export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole, AchievementStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (
      !session ||
      (session.user.role !== UserRole.HOD &&
        session.user.role !== UserRole.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const status = searchParams.get("status") as AchievementStatus | null
    const academicYear = searchParams.get("academicYear")
    const category = searchParams.get("category")
    const programId = searchParams.get("programId")
    const academicStructureId = searchParams.get("academicStructureId")

    const departmentId =
      session.user.assignedDepartmentId || session.user.departmentId

    const where: any = {}

    // 👇 Key logic: allow HOD to see all SUBMITTED achievements
    if (status && status !== AchievementStatus.SUBMITTED) {
      where.student = {
        departmentId,
      }
    }

    // Filters
    if (status) where.status = status
    if (academicYear) where.academicYear = academicYear
    if (category) where.category = category

    if (programId) {
      where.student = {
        ...where.student,
        programId,
      }
    }

    if (academicStructureId) {
      where.student = {
        ...where.student,
        academicStructureId,
      }
    }

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

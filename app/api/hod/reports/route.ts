export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

// GET reports for HOD
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
    const type = searchParams.get("type") // monthly | semester | class | division | batch
    const academicYear = searchParams.get("academicYear")
    const programId = searchParams.get("programId")
    const academicStructureId = searchParams.get("academicStructureId")
    const divisionId = searchParams.get("divisionId")
    const batchId = searchParams.get("batchId")

    /**
     * IMPORTANT:
     * Reports include ONLY VERIFIED achievements.
     * We intentionally DO NOT filter by student.departmentId
     * because many students still have departmentId = NULL.
     */
    const where: any = {
      status: { in: ["SUBMITTED", "VERIFIED"] },
    }


    // Optional filters
    if (academicYear) where.academicYear = academicYear
    if (programId) where.student = { ...where.student, programId }
    if (academicStructureId)
      where.student = { ...where.student, academicStructureId }
    if (divisionId) where.student = { ...where.student, divisionId }
    if (batchId) where.student = { ...where.student, batchId }

    const achievements = await prisma.achievement.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
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
        eventDate: "desc",
      },
    })

    // Aggregate data based on report type
    let reportData: any = {}

    switch (type) {
      case "monthly":
        reportData = achievements.reduce((acc: any, achievement) => {
          const key = new Date(achievement.eventDate).toLocaleString(
            "default",
            { month: "long", year: "numeric" }
          )
          if (!acc[key]) acc[key] = []
          acc[key].push(achievement)
          return acc
        }, {})
        break

      case "semester":
        reportData = achievements.reduce((acc: any, achievement) => {
          const key = achievement.semester || "N/A"
          if (!acc[key]) acc[key] = []
          acc[key].push(achievement)
          return acc
        }, {})
        break

      case "class":
        reportData = achievements.reduce((acc: any, achievement) => {
          const key = achievement.student.academicStructure?.name || "N/A"
          if (!acc[key]) acc[key] = []
          acc[key].push(achievement)
          return acc
        }, {})
        break

      case "division":
        reportData = achievements.reduce((acc: any, achievement) => {
          const key = achievement.student.division?.name || "N/A"
          if (!acc[key]) acc[key] = []
          acc[key].push(achievement)
          return acc
        }, {})
        break

      case "batch":
        reportData = achievements.reduce((acc: any, achievement) => {
          const key = achievement.student.batch?.name || "N/A"
          if (!acc[key]) acc[key] = []
          acc[key].push(achievement)
          return acc
        }, {})
        break

      default:
        reportData = {
          total: achievements.length,
          achievements,
        }
    }

    return NextResponse.json({
      type: type || "all",
      academicYear: academicYear || "All",
      totalAchievements: achievements.length,
      data: reportData,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}

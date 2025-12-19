import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

// GET reports for HOD
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== UserRole.HOD && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "monthly", "semester", "yearly", "class", "division", "batch"
    const academicYear = searchParams.get("academicYear")
    const programId = searchParams.get("programId")
    const academicStructureId = searchParams.get("academicStructureId")
    const divisionId = searchParams.get("divisionId")
    const batchId = searchParams.get("batchId")

    const departmentId = session.user.assignedDepartmentId || session.user.departmentId

    // Build where clause
    const where: any = {
      student: {
        departmentId: departmentId,
      },
      status: "VERIFIED", // Only verified achievements
    }

    if (academicYear) where.academicYear = academicYear
    if (programId) where.student.programId = programId
    if (academicStructureId) where.student.academicStructureId = academicStructureId
    if (divisionId) where.student.divisionId = divisionId
    if (batchId) where.student.batchId = batchId

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
          const month = new Date(achievement.eventDate).toLocaleString("default", { month: "long", year: "numeric" })
          if (!acc[month]) acc[month] = []
          acc[month].push(achievement)
          return acc
        }, {})
        break

      case "semester":
        reportData = achievements.reduce((acc: any, achievement) => {
          const semester = achievement.semester || "N/A"
          if (!acc[semester]) acc[semester] = []
          acc[semester].push(achievement)
          return acc
        }, {})
        break

      case "class":
        reportData = achievements.reduce((acc: any, achievement) => {
          const className = achievement.student.academicStructure?.name || "N/A"
          if (!acc[className]) acc[className] = []
          acc[className].push(achievement)
          return acc
        }, {})
        break

      case "division":
        reportData = achievements.reduce((acc: any, achievement) => {
          const divisionName = achievement.student.division?.name || "N/A"
          if (!acc[divisionName]) acc[divisionName] = []
          acc[divisionName].push(achievement)
          return acc
        }, {})
        break

      case "batch":
        reportData = achievements.reduce((acc: any, achievement) => {
          const batchName = achievement.student.batch?.name || "N/A"
          if (!acc[batchName]) acc[batchName] = []
          acc[batchName].push(achievement)
          return acc
        }, {})
        break

      default:
        reportData = {
          total: achievements.length,
          achievements: achievements,
        }
    }

    return NextResponse.json({
      type,
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


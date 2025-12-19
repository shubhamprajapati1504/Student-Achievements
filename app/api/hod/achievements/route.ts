import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

// GET achievements for HOD's department
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== UserRole.HOD && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const academicYear = searchParams.get("academicYear")
    const category = searchParams.get("category")
    const programId = searchParams.get("programId")
    const academicStructureId = searchParams.get("academicStructureId")

    // Build where clause - HOD can see all students in their department
    const where: any = {
      student: {
        departmentId: session.user.assignedDepartmentId || session.user.departmentId,
      },
    }

    if (status) where.status = status
    if (academicYear) where.academicYear = academicYear
    if (category) where.category = category
    if (programId) where.student.programId = programId
    if (academicStructureId) where.student.academicStructureId = academicStructureId

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


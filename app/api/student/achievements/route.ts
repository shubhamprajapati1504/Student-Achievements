import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole, AchievementCategory, AchievementStatus } from "@prisma/client"
import { z } from "zod"
import { getAcademicYear } from "@/lib/utils"

const achievementSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.nativeEnum(AchievementCategory),
  eventDate: z.string().transform((str) => new Date(str)),
  academicYear: z.string().optional(),
  semester: z.string().optional(),
  certificatePath: z.string().optional(),
  photoPath: z.string().optional(),
  isGroupAchievement: z.boolean().default(false),
  groupMembers: z.string().optional(),
})

// GET student's achievements
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== UserRole.STUDENT && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const academicYear = searchParams.get("academicYear")

    const where: any = {
      studentId: session.user.id,
    }

    if (category) where.category = category
    if (status) where.status = status
    if (academicYear) where.academicYear = academicYear

    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: {
        eventDate: "desc",
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

// POST create achievement
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = achievementSchema.parse(body)

    // Set academic year if not provided
    const academicYear = data.academicYear || getAcademicYear(data.eventDate)

    const achievement = await prisma.achievement.create({
      data: {
        ...data,
        academicYear,
        studentId: session.user.id,
        status: AchievementStatus.SUBMITTED,
      },
    })

    return NextResponse.json(achievement, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }
    
    console.error("Error creating achievement:", error)
    return NextResponse.json(
      { error: "Failed to create achievement" },
      { status: 500 }
    )
  }
}


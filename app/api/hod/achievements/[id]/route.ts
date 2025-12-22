export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole, AchievementStatus } from "@prisma/client"

/**
 * GET single achievement (HOD / Admin)
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await auth()

    if (
      !session ||
      (session.user.role !== UserRole.HOD &&
        session.user.role !== UserRole.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const achievement = await prisma.achievement.findFirst({
      where: { id },
      include: {
        student: {
          include: {
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

    return NextResponse.json(achievement)
  } catch (error) {
    console.error("Error fetching achievement:", error)
    return NextResponse.json(
      { error: "Failed to fetch achievement" },
      { status: 500 }
    )
  }
}

/**
 * PATCH approve / reject achievement (HOD / Admin)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await auth()

    console.log("SESSION USER:", session?.user)

    if (
      !session ||
      (session.user.role !== UserRole.HOD &&
        session.user.role !== UserRole.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, remarks } = (await request.json()) as {
      status: AchievementStatus
      remarks?: string
    }

    if (
      status !== AchievementStatus.VERIFIED &&
      status !== AchievementStatus.REJECTED
    ) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
      )
    }

    const achievement = await prisma.achievement.findFirst({
      where: { id },
    })

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      )
    }

    if (achievement.status !== AchievementStatus.SUBMITTED) {
      return NextResponse.json(
        { error: "Achievement already processed" },
        { status: 400 }
      )
    }

    const updated = await prisma.achievement.update({
      where: { id },
      data: {
        status,
        remarks,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating achievement:", error)
    return NextResponse.json(
      { error: "Failed to update achievement" },
      { status: 500 }
    )
  }
}



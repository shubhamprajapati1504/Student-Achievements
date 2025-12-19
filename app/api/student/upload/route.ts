import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import { saveFile, parseFormData } from "@/lib/upload"

// POST upload file (certificate or photo)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await parseFormData(request)
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "certificate" or "photo"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!type || (type !== "certificate" && type !== "photo")) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'certificate' or 'photo'" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = type === "certificate" 
      ? ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      : ["image/jpeg", "image/jpg", "image/png"]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    const filePath = await saveFile(file, type)

    return NextResponse.json({ 
      path: filePath,
      message: "File uploaded successfully" 
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}


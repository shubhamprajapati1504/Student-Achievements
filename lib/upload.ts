import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { NextRequest } from "next/server"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function saveFile(file: File, subfolder: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const timestamp = Date.now()
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const filename = `${timestamp}_${originalName}`
  
  const folderPath = join(UPLOAD_DIR, subfolder)
  await mkdir(folderPath, { recursive: true })
  
  const filepath = join(folderPath, filename)
  await writeFile(filepath, buffer)
  
  return `/uploads/${subfolder}/${filename}`
}

export async function parseFormData(request: NextRequest) {
  const formData = await request.formData()
  return formData
}


"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AchievementCategory } from "@prisma/client"

type StudentInfo = {
  name: string
  email: string
  studentId?: string
  department?: { name: string }
  program?: { name: string }
  academicStructure?: { name: string }
  division?: { name: string }
  batch?: { name: string }
}

type Achievement = {
  id: string
  title: string
  description: string
  category: AchievementCategory
  eventDate: string
  academicYear: string
  semester?: string
  certificatePath?: string
  photoPath?: string
  isGroupAchievement: boolean
  groupMembers?: string
  status: string
  student: StudentInfo
}

export default function ViewAchievementPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/student/achievements/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setAchievement(data)
        }
      })
      .catch(() => setError("Failed to load achievement"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="p-8">Loading...</p>
  if (error) return <p className="p-8 text-red-600">{error}</p>
  if (!achievement) return null

  const {
    title,
    description,
    category,
    eventDate,
    academicYear,
    semester,
    isGroupAchievement,
    groupMembers,
    certificatePath,
    photoPath,
    status,
    student,
  } = achievement

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Achievement Details</h1>

        {status === "SUBMITTED" && (
          <button
            onClick={() => router.push(`/student/achievements/${id}/edit`)}
            className="text-indigo-600 font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {/* Status */}
      <span
        className={`inline-block px-3 py-1 rounded text-sm font-medium ${
          status === "SUBMITTED"
            ? "bg-yellow-100 text-yellow-800"
            : status === "VERIFIED"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {status}
      </span>

      {/* Main Info */}
      <div className="space-y-2">
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Description:</strong></p>
        <p className="whitespace-pre-wrap text-gray-700">{description}</p>

        <p><strong>Category:</strong> {category.replaceAll("_", " ")}</p>
        <p><strong>Event Date:</strong> {new Date(eventDate).toDateString()}</p>
        <p><strong>Academic Year:</strong> {academicYear}</p>
        {semester && <p><strong>Semester:</strong> {semester}</p>}
      </div>

      {/* Group Info */}
      {isGroupAchievement && (
        <div>
          <p><strong>Group Members:</strong></p>
          <p className="whitespace-pre-wrap text-gray-700">
            {groupMembers || "—"}
          </p>
        </div>
      )}

      {/* Files */}
      {(certificatePath || photoPath) && (
        <div className="space-y-2">
          <h2 className="font-semibold">Attachments</h2>

          {certificatePath && (
            <a
              href={certificatePath}
              target="_blank"
              className="text-indigo-600 underline"
            >
              View Certificate
            </a>
          )}

          {photoPath && (
            <a
              href={photoPath}
              target="_blank"
              className="text-indigo-600 underline"
            >
              View Photo
            </a>
          )}
        </div>
      )}

      {/* Student Info */}
      <div className="border-t pt-4 space-y-1 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-900">Student Details</h2>
        <p>Name: {student.name}</p>
        <p>Email: {student.email}</p>
        {student.studentId && <p>Student ID: {student.studentId}</p>}
        {student.department && <p>Department: {student.department.name}</p>}
        {student.program && <p>Program: {student.program.name}</p>}
        {student.academicStructure && (
          <p>Year: {student.academicStructure.name}</p>
        )}
        {student.division && <p>Division: {student.division.name}</p>}
        {student.batch && <p>Batch: {student.batch.name}</p>}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { formatDate } from "@/lib/utils"
import { AchievementStatus } from "@prisma/client"

interface Achievement {
  id: string
  title: string
  description: string
  category: string
  status: string
  eventDate: string
  academicYear: string
  semester: string | null
  certificatePath: string | null
  photoPath: string | null
  isGroupAchievement: boolean
  groupMembers: string | null
  remarks: string | null
  student: {
    name: string
    email: string
    studentId: string | null
    department: { name: string } | null
    program: { name: string } | null
    academicStructure: { name: string } | null
    division: { name: string } | null
    batch: { name: string } | null
  }
}

export default function AchievementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<AchievementStatus>(AchievementStatus.SUBMITTED)
  const [remarks, setRemarks] = useState("")

  useEffect(() => {
    fetchAchievement()
  }, [params.id])

  const fetchAchievement = async () => {
    try {
      const response = await fetch(`/api/student/achievements/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAchievement(data)
        setVerificationStatus(data.status)
      }
    } catch (error) {
      console.error("Error fetching achievement:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (status: AchievementStatus) => {
    setVerifying(true)
    try {
      const response = await fetch(`/api/advisor/achievements/${params.id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          remarks: remarks || undefined,
        }),
      })

      if (response.ok) {
        router.push("/advisor/achievements")
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to verify achievement")
      }
    } catch (error) {
      console.error("Error verifying achievement:", error)
      alert("An error occurred")
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!achievement) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <p>Achievement not found</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-indigo-600 hover:text-indigo-500"
        >
          ← Back
        </button>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{achievement.title}</h1>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                achievement.status === "VERIFIED" ? "bg-green-100 text-green-800" :
                achievement.status === "REJECTED" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {achievement.status}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="mt-1 text-sm text-gray-900">{achievement.category.replace(/_/g, " ")}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{achievement.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Event Date</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(achievement.eventDate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Academic Year</h3>
                <p className="mt-1 text-sm text-gray-900">{achievement.academicYear}</p>
              </div>
            </div>

            {achievement.semester && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Semester</h3>
                <p className="mt-1 text-sm text-gray-900">{achievement.semester}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Student Information</h3>
              <div className="mt-1 text-sm text-gray-900">
                <p><strong>Name:</strong> {achievement.student.name}</p>
                <p><strong>Student ID:</strong> {achievement.student.studentId || "N/A"}</p>
                <p><strong>Department:</strong> {achievement.student.department?.name || "N/A"}</p>
                <p><strong>Program:</strong> {achievement.student.program?.name || "N/A"}</p>
                <p><strong>Class:</strong> {achievement.student.academicStructure?.name || "N/A"}</p>
                <p><strong>Division:</strong> {achievement.student.division?.name || "N/A"}</p>
                <p><strong>Batch:</strong> {achievement.student.batch?.name || "N/A"}</p>
              </div>
            </div>

            {achievement.isGroupAchievement && achievement.groupMembers && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Group Members</h3>
                <p className="mt-1 text-sm text-gray-900">{achievement.groupMembers}</p>
              </div>
            )}

            {achievement.certificatePath && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Certificate</h3>
                <a
                  href={achievement.certificatePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View Certificate
                </a>
              </div>
            )}

            {achievement.photoPath && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Photo</h3>
                <img
                  src={achievement.photoPath}
                  alt="Achievement photo"
                  className="mt-2 max-w-md rounded-lg"
                />
              </div>
            )}

            {achievement.remarks && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Remarks</h3>
                <p className="mt-1 text-sm text-gray-900">{achievement.remarks}</p>
              </div>
            )}

            {achievement.status === "SUBMITTED" && (
              <div className="border-t pt-4 mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Verification</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                      Remarks (optional)
                    </label>
                    <textarea
                      id="remarks"
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Add any remarks or comments..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVerify(AchievementStatus.VERIFIED)}
                      disabled={verifying}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {verifying ? "Verifying..." : "Verify"}
                    </button>
                    <button
                      onClick={() => handleVerify(AchievementStatus.REJECTED)}
                      disabled={verifying}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {verifying ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


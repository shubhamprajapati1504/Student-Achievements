"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { AchievementCategory } from "@prisma/client"

export default function NewAchievementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: AchievementCategory.TECHNICAL_COMPETITIONS,
    eventDate: "",
    academicYear: "",
    semester: "",
    isGroupAchievement: false,
    groupMembers: "",
  })
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [certificatePath, setCertificatePath] = useState("")
  const [photoPath, setPhotoPath] = useState("")

  const handleFileUpload = async (file: File, type: "certificate" | "photo") => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/student/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      return data.path
    } catch (err: any) {
      throw new Error(err.message || "Upload failed")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Upload files if provided
      if (certificateFile) {
        const path = await handleFileUpload(certificateFile, "certificate")
        setCertificatePath(path)
        formData.certificatePath = path
      }
      if (photoFile) {
        const path = await handleFileUpload(photoFile, "photo")
        setPhotoPath(path)
        formData.photoPath = path
      }

      const response = await fetch("/api/student/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          certificatePath: formData.certificatePath || certificatePath,
          photoPath: formData.photoPath || photoPath,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create achievement")
      }

      router.push("/student/achievements")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Achievement</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AchievementCategory })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {Object.values(AchievementCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
              Event Date *
            </label>
            <input
              type="date"
              id="eventDate"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
                Academic Year
              </label>
              <input
                type="text"
                id="academicYear"
                placeholder="e.g., 2023-24"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Semester
              </label>
              <input
                type="text"
                id="semester"
                placeholder="e.g., Semester 1"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isGroupAchievement}
                onChange={(e) => setFormData({ ...formData, isGroupAchievement: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Group Achievement</span>
            </label>
          </div>

          {formData.isGroupAchievement && (
            <div>
              <label htmlFor="groupMembers" className="block text-sm font-medium text-gray-700">
                Group Members (comma-separated)
              </label>
              <input
                type="text"
                id="groupMembers"
                value={formData.groupMembers}
                onChange={(e) => setFormData({ ...formData, groupMembers: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="certificate" className="block text-sm font-medium text-gray-700">
              Certificate (PDF/JPG/PNG)
            </label>
            <input
              type="file"
              id="certificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
              Photo (JPG/PNG)
            </label>
            <input
              type="file"
              id="photo"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Achievement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


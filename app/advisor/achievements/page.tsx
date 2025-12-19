"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface Achievement {
  id: string
  title: string
  description: string
  category: string
  status: string
  eventDate: string
  academicYear: string
  student: {
    name: string
    studentId: string | null
    academicStructure: { name: string } | null
    division: { name: string } | null
    batch: { name: string } | null
  }
}

export default function AdvisorAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    academicYear: "",
    category: "",
  })

  useEffect(() => {
    fetchAchievements()
  }, [filters])

  const fetchAchievements = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.academicYear) params.append("academicYear", filters.academicYear)
      if (filters.category) params.append("category", filters.category)

      const response = await fetch(`/api/advisor/achievements?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAchievements(data)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
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

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Achievements</h1>

        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={filters.academicYear}
                onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                placeholder="e.g., 2023-24"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="TECHNICAL_COMPETITIONS">Technical Competitions</option>
                <option value="HACKATHONS">Hackathons</option>
                <option value="INTERNSHIPS">Internships</option>
                <option value="CERTIFICATIONS">Certifications</option>
                <option value="RESEARCH_PUBLICATIONS">Research & Publications</option>
                <option value="SPORTS_CULTURAL">Sports & Cultural</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {achievements.map((achievement) => (
              <li key={achievement.id}>
                <Link href={`/advisor/achievements/${achievement.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {achievement.title}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          achievement.status === "VERIFIED" ? "bg-green-100 text-green-800" :
                          achievement.status === "REJECTED" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {achievement.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {achievement.category.replace(/_/g, " ")}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {achievement.student.name} ({achievement.student.studentId || "N/A"})
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {achievement.student.academicStructure?.name} - {achievement.student.division?.name} - Batch {achievement.student.batch?.name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{formatDate(achievement.eventDate)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}


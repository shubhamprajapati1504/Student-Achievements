"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"

export default function HODReportsPage() {
  const [type, setType] = useState("monthly")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchReport = async () => {
    setLoading(true)
    setError("")
    setData(null)

    try {
      const res = await fetch(`/api/hod/reports?type=${type}`)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Failed to generate report")
      } else {
        setData(json)
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  // -------- CSV DOWNLOAD --------
  const downloadCSV = () => {
    if (!data) return

    const rows: string[] = []
    rows.push(
      [
        "Group",
        "Title",
        "Category",
        "Status",
        "Student Name",
        "Academic Year",
        "Event Date",
      ].join(",")
    )

    Object.entries(data.data).forEach(([group, achievements]: any) => {
      achievements.forEach((ach: any) => {
        rows.push(
          [
            `"${group}"`,
            `"${ach.title}"`,
            `"${ach.category.replaceAll("_", " ")}"`,
            ach.status,
            `"${ach.student?.name || ""}"`,
            ach.academicYear,
            new Date(ach.eventDate).toLocaleDateString(),
          ].join(",")
        )
      })
    })

    const blob = new Blob([rows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `hod-report-${type}.csv`
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Generate Reports
        </h1>

        <p className="text-sm text-gray-500">
          Reports show submitted and verified achievements. Download as CSV for offline use.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border rounded-md px-4 py-2 text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="semester">Semester</option>
            <option value="class">Class</option>
            <option value="division">Division</option>
            <option value="batch">Batch</option>
          </select>

          <button
            onClick={fetchReport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-sm font-medium"
          >
            Generate Report
          </button>

          {data && (
            <button
              onClick={downloadCSV}
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-md text-sm font-medium"
            >
              Download CSV
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-600">Generating report...</p>}

        {/* Error */}
        {error && <p className="text-red-600">{error}</p>}

        {/* Report Output */}
        {data && (
          <div className="bg-white shadow rounded-lg p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Report Summary
              </h2>
              <p className="text-sm text-gray-600">
                Total achievements:{" "}
                <span className="font-medium">{data.totalAchievements}</span>
              </p>
            </div>

            {Object.keys(data.data).length === 0 ? (
              <p className="text-gray-500 text-sm">
                No achievements available.
              </p>
            ) : (
              <div className="space-y-8">
                {Object.entries(data.data).map(([group, achievements]: any) => (
                  <div key={group}>
                    <h3 className="text-md font-semibold text-indigo-700 mb-3">
                      {group}
                    </h3>

                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Category</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Student</th>
                            <th className="px-4 py-2 text-left">Academic Year</th>
                            <th className="px-4 py-2 text-left">Event Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {achievements.map((ach: any) => (
                            <tr key={ach.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium">
                                {ach.title}
                              </td>
                              <td className="px-4 py-2">
                                {ach.category.replaceAll("_", " ")}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    ach.status === "VERIFIED"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {ach.status}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                {ach.student?.name || "—"}
                              </td>
                              <td className="px-4 py-2">
                                {ach.academicYear}
                              </td>
                              <td className="px-4 py-2">
                                {new Date(ach.eventDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

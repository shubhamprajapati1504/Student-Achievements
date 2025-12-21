"use client"

import { useEffect, useState } from "react"

interface Program {
  id: string
  name: string
  code: string
  type: string
  description: string | null
  department: {
    id: string
    name: string
  }
  _count: {
    students: number
  }
}

interface Department {
  id: string
  name: string
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "UNDERGRADUATE",
    description: "",
    departmentId: "",
  })

  useEffect(() => {
    fetchPrograms()
    fetchDepartments()
  }, [])

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/admin/programs")
      if (res.ok) {
        setPrograms(await res.json())
      }
    } catch (err) {
      console.error("Error fetching programs:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments")
      if (res.ok) {
        setDepartments(await res.json())
      }
    } catch (err) {
      console.error("Error fetching departments:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Failed to create program")
        return
      }

      setShowForm(false)
      setFormData({
        name: "",
        code: "",
        type: "UNDERGRADUATE",
        description: "",
        departmentId: "",
      })
      fetchPrograms()
    } catch (err) {
      console.error("Error creating program:", err)
      alert("An error occurred")
    }
  }

  if (loading) {
    return (
      <div>
        <div className="max-w-7xl mx-auto py-6 px-6">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto py-6 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showForm ? "Cancel" : "Add Program"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Add New Program</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Code *</label>
                <input
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="UG">Undergraduate</option>
                  <option value="PG">Postgraduate</option>
                  <option value="PHD">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Department *
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      departmentId: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Create Program
              </button>
            </form>
          </div>
        )}

        <div className="bg-white shadow sm:rounded-md">
          <ul className="divide-y">
            {programs.map((program) => (
              <li key={program.id} className="px-4 py-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-indigo-600">
                      {program.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {program.code} • {program.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Department: {program.department.name}
                    </p>
                    {program.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {program.description}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    {program._count.students} students
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

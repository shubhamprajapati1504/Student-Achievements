"use client"

import { useEffect, useState } from "react"
import { UserRole } from "@prisma/client"

type Department = {
  id: string
  name: string
}

type Program = {
  id: string
  name: string
}

type AcademicStructure = {
  id: string
  name: string
  code: string
  level: number
  isSemester: boolean
  semester?: number
  department: Department
  program: Program
}

export default function AcademicStructuresPage() {
  const [academicStructures, setAcademicStructures] = useState<AcademicStructure[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [programs, setPrograms] = useState<Program[]>([])

  const [departmentId, setDepartmentId] = useState("")
  const [programId, setProgramId] = useState("")

  const [form, setForm] = useState({
    name: "",
    code: "",
    level: 1,
    isSemester: false,
    semester: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ───────────────── Fetch dropdown data ─────────────────
  useEffect(() => {
    fetch("/api/admin/departments")
      .then(res => res.json())
      .then(setDepartments)

    fetch("/api/admin/programs")
      .then(res => res.json())
      .then(setPrograms)
  }, [])

  // ───────────────── Fetch academic structures ─────────────────
  useEffect(() => {
    const params = new URLSearchParams()
    if (departmentId) params.append("departmentId", departmentId)
    if (programId) params.append("programId", programId)

    fetch(`/api/admin/academic-structures?${params}`)
      .then(res => res.json())
      .then(setAcademicStructures)
  }, [departmentId, programId])

  // ───────────────── Create academic structure ─────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/academic-structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          level: Number(form.level),
          semester: form.isSemester ? Number(form.semester) : undefined,
          departmentId,
          programId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to create academic structure")
        return
      }

      setAcademicStructures(prev => [...prev, data])
      setForm({ name: "", code: "", level: 1, isSemester: false, semester: "" })
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Academic Structures</h1>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={departmentId}
          onChange={e => setDepartmentId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Department</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={programId}
          onChange={e => setProgramId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Program</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="border p-4 rounded space-y-4 max-w-xl">
        <h2 className="font-semibold">Create Academic Structure</h2>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          placeholder="Name (e.g. FE)"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="input"
          required
        />

        <input
          placeholder="Code (e.g. FE)"
          value={form.code}
          onChange={e => setForm({ ...form, code: e.target.value })}
          className="input"
          required
        />

        <input
          type="number"
          placeholder="Level"
          value={form.level}
          onChange={e => setForm({ ...form, level: Number(e.target.value) })}
          className="input"
          required
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isSemester}
            onChange={e => setForm({ ...form, isSemester: e.target.checked })}
          />
          Semester-based
        </label>

        {form.isSemester && (
          <input
            type="number"
            placeholder="Semester number"
            value={form.semester}
            onChange={e => setForm({ ...form, semester: e.target.value })}
            className="input"
          />
        )}

        <button
          type="submit"
          disabled={loading || !departmentId || !programId}
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>

      {/* List */}
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Name</th>
              <th>Code</th>
              <th>Level</th>
              <th>Program</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {academicStructures.map(a => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.name}</td>
                <td>{a.code}</td>
                <td>{a.level}</td>
                <td>{a.program.name}</td>
                <td>{a.department.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

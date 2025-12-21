"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
  studentId?: string
  phone?: string
  department?: { name: string }
  program?: { name: string }
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [roleFilter, setRoleFilter] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "STUDENT",
    studentId: "",
    phone: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const query = roleFilter ? `?role=${roleFilter}` : ""
      const res = await fetch(`/api/admin/users${query}`)
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Failed to create user")
        return
      }

      setShowForm(false)
      setFormData({
        email: "",
        password: "",
        name: "",
        role: "STUDENT",
        studentId: "",
        phone: "",
      })
      fetchUsers()
    } catch (err) {
      console.error("Error creating user:", err)
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
          <h1 className="text-3xl font-bold">Users</h1>

          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
            </select>

            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              {showForm ? "Cancel" : "Add User"}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Create User</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border rounded-md px-3 py-2"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border rounded-md px-3 py-2"
              />

              <input
                required
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="border rounded-md px-3 py-2"
              />

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="border rounded-md px-3 py-2"
              >
                <option value="ADMIN">Admin</option>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
              </select>

              {formData.role === "STUDENT" && (
                <input
                  placeholder="Student ID"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  className="border rounded-md px-3 py-2 col-span-2"
                />
              )}

              <input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="border rounded-md px-3 py-2 col-span-2"
              />

              <button
                type="submit"
                className="col-span-2 bg-indigo-600 text-white py-2 rounded-md"
              >
                Create User
              </button>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-md overflow-hidden">
          <ul className="divide-y">
            {users.map((user) => (
              <li key={user.id} className="px-4 py-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-indigo-600">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.email} • {user.role}
                    </p>
                    {user.studentId && (
                      <p className="text-sm text-gray-500">
                        Student ID: {user.studentId}
                      </p>
                    )}
                    {user.department && (
                      <p className="text-sm text-gray-500">
                        Dept: {user.department.name}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
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

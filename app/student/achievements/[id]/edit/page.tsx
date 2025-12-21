"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AchievementCategory } from "@prisma/client"

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
}

export default function EditAchievementPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // ───────────── Fetch achievement ─────────────
  useEffect(() => {
    fetch(`/api/student/achievements/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setAchievement({
            ...data,
            eventDate: data.eventDate.split("T")[0],
          })
        }
      })
      .catch(() => setError("Failed to load achievement"))
      .finally(() => setLoading(false))
  }, [id])

  // ───────────── Save changes ─────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!achievement) return

    setSaving(true)
    setError("")

    const res = await fetch(`/api/student/achievements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(achievement),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Update failed")
      setSaving(false)
      return
    }

    router.push("/student/achievements")
  }

  if (loading) return <p className="p-8">Loading...</p>
  if (error) return <p className="p-8 text-red-600">{error}</p>
  if (!achievement) return null

  if (achievement.status !== "SUBMITTED") {
    return (
      <p className="p-8 text-red-600">
        This achievement cannot be edited after verification.
      </p>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Edit Achievement</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input"
          value={achievement.title}
          onChange={e => setAchievement({ ...achievement, title: e.target.value })}
          placeholder="Title"
          required
        />

        <textarea
          className="input"
          rows={4}
          value={achievement.description}
          onChange={e => setAchievement({ ...achievement, description: e.target.value })}
          placeholder="Description"
          required
        />

        <select
          className="input"
          value={achievement.category}
          onChange={e =>
            setAchievement({
              ...achievement,
              category: e.target.value as AchievementCategory,
            })
          }
        >
          {Object.values(AchievementCategory).map(cat => (
            <option key={cat} value={cat}>
              {cat.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="input"
          value={achievement.eventDate}
          onChange={e =>
            setAchievement({ ...achievement, eventDate: e.target.value })
          }
        />

        <input
          className="input"
          value={achievement.academicYear}
          onChange={e =>
            setAchievement({ ...achievement, academicYear: e.target.value })
          }
          placeholder="Academic Year (e.g. 2023-24)"
        />

        <input
          className="input"
          value={achievement.semester || ""}
          onChange={e =>
            setAchievement({ ...achievement, semester: e.target.value })
          }
          placeholder="Semester (optional)"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={achievement.isGroupAchievement}
            onChange={e =>
              setAchievement({
                ...achievement,
                isGroupAchievement: e.target.checked,
              })
            }
          />
          Group achievement
        </label>

        {achievement.isGroupAchievement && (
          <textarea
            className="input"
            rows={2}
            value={achievement.groupMembers || ""}
            onChange={e =>
              setAchievement({ ...achievement, groupMembers: e.target.value })
            }
            placeholder="Group members (comma-separated / JSON)"
          />
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}

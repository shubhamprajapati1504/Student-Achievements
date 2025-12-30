import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { authAPI } from "../../services/api"

export default function ProfileUpdateForm() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    try {
      const response = await authAPI.updateDetails({ name: name.trim() })
      if (response.success) {
        setSuccess("Profile updated successfully")
        // Update user in context and localStorage
        const updatedUser = { ...user, name: response.data.name }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      } else {
        setError(response.error || "Failed to update profile")
      }
    } catch (err) {
      setError(err.error || err.message || "Failed to update profile")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={user?.email || ""}
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        Update Profile
      </button>
    </form>
  )
}
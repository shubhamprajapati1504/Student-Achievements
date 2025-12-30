import { useState } from "react"
import { authAPI } from "../../services/api"

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!currentPassword || !newPassword) {
      setError("Both fields are required")
      return
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters")
      return
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    try {
      const response = await authAPI.updatePassword(currentPassword, newPassword)
      if (response.success) {
        setSuccess("Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
      } else {
        setError(response.error || "Failed to update password")
      }
    } catch (err) {
      setError(err.error || err.message || "Failed to update password")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
          required
          minLength={6}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        Change Password
      </button>
    </form>
  )
}


import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

const login = async (email, password) => {
  setLoading(true)
  try {
    const result = await authAPI.login(email, password)
    if (!result.success) {
      throw new Error(result.error || "Invalid credentials")
    }

    const { user, token } = result.data

    setUser(user)
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("token", token) // ✅ ADD THIS

    return user
  } finally {
    setLoading(false)
  }
}


  const logout = () => {
    authAPI.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { UserRole } from "@prisma/client"

export default function Navbar() {
  const { data: session } = useSession()

  if (!session) return null

  const getRoleRoutes = () => {
    switch (session.user.role) {
      case UserRole.ADMIN:
        return [
          { href: "/admin", label: "Admin Dashboard" },
          { href: "/admin/departments", label: "Departments" },
          { href: "/admin/programs", label: "Programs" },
          { href: "/admin/users", label: "Users" },
        ]
      case UserRole.HOD:
        return [
          { href: "/hod", label: "HOD Dashboard" },
          { href: "/hod/achievements", label: "Achievements" },
          { href: "/hod/reports", label: "Reports" },
        ]
      case UserRole.CLASS_ADVISOR:
        return [
          { href: "/advisor", label: "Advisor Dashboard" },
          { href: "/advisor/achievements", label: "Achievements" },
          { href: "/advisor/reports", label: "Reports" },
        ]
      case UserRole.STUDENT:
        return [
          { href: "/student", label: "My Dashboard" },
          { href: "/student/achievements", label: "My Achievements" },
          { href: "/student/achievements/new", label: "Add Achievement" },
        ]
      default:
        return []
    }
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Student Achievements
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getRoleRoutes().map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {session.user.name} ({session.user.role})
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}


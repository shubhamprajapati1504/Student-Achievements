import { redirect } from "next/navigation"
import { auth } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import Navbar from "@/components/Navbar"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/signin")
  }

  const stats = {
    departments: await prisma.department.count(),
    programs: await prisma.program.count(),
    users: await prisma.user.count(),
    achievements: await prisma.achievement.count(),
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900">{stats.departments}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900">{stats.programs}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Programs</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900">{stats.users}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900">{stats.achievements}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Achievements</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/admin/departments"
                className="block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
              >
                Manage Departments
              </Link>
              <Link
                href="/admin/programs"
                className="block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
              >
                Manage Programs
              </Link>
              <Link
                href="/admin/users"
                className="block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
              >
                Manage Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


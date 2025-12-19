import { redirect } from "next/navigation"
import { auth } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import Navbar from "@/components/Navbar"
import { prisma } from "@/lib/prisma"

export default async function StudentDashboard() {
  const session = await auth()

  if (!session || session.user.role !== UserRole.STUDENT) {
    redirect("/auth/signin")
  }

  const achievements = await prisma.achievement.findMany({
    where: {
      studentId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  const stats = {
    total: await prisma.achievement.count({
      where: { studentId: session.user.id },
    }),
    verified: await prisma.achievement.count({
      where: { studentId: session.user.id, status: "VERIFIED" },
    }),
    pending: await prisma.achievement.count({
      where: { studentId: session.user.id, status: "SUBMITTED" },
    }),
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Achievements</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Verified</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h2>
            {achievements.length === 0 ? (
              <p className="text-gray-500">No achievements yet. <a href="/student/achievements/new" className="text-indigo-600 hover:text-indigo-500">Add your first achievement</a></p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {achievements.map((achievement) => (
                  <li key={achievement.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-500">{achievement.category.replace(/_/g, " ")}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          achievement.status === "VERIFIED" ? "bg-green-100 text-green-800" :
                          achievement.status === "REJECTED" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {achievement.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


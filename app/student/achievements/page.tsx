import { redirect } from "next/navigation"
import { auth } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import Navbar from "@/components/Navbar"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default async function StudentAchievementsPage() {
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
  })

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Achievements</h1>
          <Link
            href="/student/achievements/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Achievement
          </Link>
        </div>

        {achievements.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-4">No achievements yet.</p>
            <Link
              href="/student/achievements/new"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Add your first achievement
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {achievements.map((achievement) => (
                <li key={achievement.id}>
                  <Link href={`/student/achievements/${achievement.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {achievement.title}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            achievement.status === "VERIFIED" ? "bg-green-100 text-green-800" :
                            achievement.status === "REJECTED" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {achievement.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {achievement.category.replace(/_/g, " ")}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {formatDate(achievement.eventDate)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>{achievement.academicYear}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}


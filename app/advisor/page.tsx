import { redirect } from "next/navigation"
import { auth } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import Navbar from "@/components/Navbar"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdvisorDashboard() {
  const session = await auth()

  if (!session || (session.user.role !== UserRole.CLASS_ADVISOR && session.user.role !== UserRole.ADMIN)) {
    redirect("/auth/signin")
  }

  const where: any = {
    student: {},
  }

  if (session.user.assignedDepartmentId) {
    where.student.departmentId = session.user.assignedDepartmentId
  }
  if (session.user.assignedProgramId) {
    where.student.programId = session.user.assignedProgramId
  }
  if (session.user.assignedAcademicStructureId) {
    where.student.academicStructureId = session.user.assignedAcademicStructureId
  }
  if (session.user.assignedDivisionId) {
    where.student.divisionId = session.user.assignedDivisionId
  }
  if (session.user.assignedBatchId) {
    where.student.batchId = session.user.assignedBatchId
  }

  const stats = {
    total: await prisma.achievement.count({ where }),
    verified: await prisma.achievement.count({
      where: { ...where, status: "VERIFIED" },
    }),
    pending: await prisma.achievement.count({
      where: { ...where, status: "SUBMITTED" },
    }),
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Class Advisor Dashboard</h1>
        
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/advisor/achievements"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-2">View Achievements</h2>
            <p className="text-sm text-gray-500">Review and verify student achievements</p>
          </Link>
          
          <Link
            href="/advisor/reports"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-2">Generate Reports</h2>
            <p className="text-sm text-gray-500">Create monthly and semester reports</p>
          </Link>
        </div>
      </div>
    </div>
  )
}


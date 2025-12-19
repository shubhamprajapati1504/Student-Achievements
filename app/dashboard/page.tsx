import { redirect } from "next/navigation"
import { auth } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import Navbar from "@/components/Navbar"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const getDashboardContent = () => {
    switch (session.user.role) {
      case UserRole.ADMIN:
        redirect("/admin")
        return null
      case UserRole.HOD:
        redirect("/hod")
        return null
      case UserRole.CLASS_ADVISOR:
        redirect("/advisor")
        return null
      case UserRole.STUDENT:
        redirect("/student")
        return null
      default:
        return <div>Unknown role</div>
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {getDashboardContent()}
      </div>
    </div>
  )
}


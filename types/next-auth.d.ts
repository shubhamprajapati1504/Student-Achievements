import { UserRole } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      studentId: string | null
      departmentId: string | null
      programId: string | null
      academicStructureId: string | null
      divisionId: string | null
      batchId: string | null
      assignedDepartmentId: string | null
      assignedProgramId: string | null
      assignedAcademicStructureId: string | null
      assignedDivisionId: string | null
      assignedBatchId: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    studentId: string | null
    departmentId: string | null
    programId: string | null
    academicStructureId: string | null
    divisionId: string | null
    batchId: string | null
    assignedDepartmentId: string | null
    assignedProgramId: string | null
    assignedAcademicStructureId: string | null
    assignedDivisionId: string | null
    assignedBatchId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    studentId: string | null
    departmentId: string | null
    programId: string | null
    academicStructureId: string | null
    divisionId: string | null
    batchId: string | null
    assignedDepartmentId: string | null
    assignedProgramId: string | null
    assignedAcademicStructureId: string | null
    assignedDivisionId: string | null
    assignedBatchId: string | null
  }
}


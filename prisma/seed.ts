import 'dotenv/config'
import { PrismaClient, UserRole, ProgramType } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Create Computer Engineering Department
  const compDept = await prisma.department.upsert({
    where: { code: "COMP" },
    update: {},
    create: {
      name: "Computer Engineering",
      code: "COMP",
      description: "Computer Engineering Department",
    },
  })

  console.log("Created department:", compDept.name)

  // Create UG Program
  const ugProgram = await prisma.program.upsert({
    where: { code: "UG" },
    update: {},
    create: {
      name: "Undergraduate",
      type: ProgramType.UG,
      code: "UG",
      description: "Undergraduate Program",
      departmentId: compDept.id,
    },
  })

  console.log("Created program:", ugProgram.name)

  // Create Academic Structures (FE, SE, TE, BE)
  const academicStructures = [
    { name: "First Year", code: "FE", level: 1 },
    { name: "Second Year", code: "SE", level: 2 },
    { name: "Third Year", code: "TE", level: 3 },
    { name: "Final Year", code: "BE", level: 4 },
  ]

  for (const structure of academicStructures) {
    await prisma.academicStructure.upsert({
      where: {
        departmentId_programId_code: {
          departmentId: compDept.id,
          programId: ugProgram.id,
          code: structure.code,
        },
      },
      update: {},
      create: {
        ...structure,
        departmentId: compDept.id,
        programId: ugProgram.id,
      },
    })
    console.log(`Created academic structure: ${structure.name}`)
  }

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
    },
  })

  console.log("Created admin user:", admin.email)

  // Create HOD User
  const hodPassword = await bcrypt.hash("hod123", 10)
  const hod = await prisma.user.upsert({
    where: { email: "hod@example.com" },
    update: {},
    create: {
      email: "hod@example.com",
      password: hodPassword,
      name: "HOD User",
      role: UserRole.HOD,
      assignedDepartmentId: compDept.id,
    },
  })

  console.log("Created HOD user:", hod.email)

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


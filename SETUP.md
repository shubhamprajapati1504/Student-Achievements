# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/student_achievements?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database (optional - creates admin and HOD users)
npm run db:seed
```

**Default Users Created by Seed:**
- Admin: `admin@example.com` / `admin123`
- HOD: `hod@example.com` / `hod123`

### 4. Create Upload Directories

```bash
mkdir -p public/uploads/certificate public/uploads/photo
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Schema Overview

The system uses a hierarchical structure:

```
Department
  └── Program (UG/PG)
      └── Academic Structure (FE/SE/TE/BE or Year/Semester)
          └── Division (A/B/C/D)
              └── Batch (1/2/3/4)
                  └── Student
                      └── Achievement
```


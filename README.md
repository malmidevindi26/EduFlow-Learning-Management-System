# EduFlow: Learning Management System

A full-stack LMS where instructors publish courses, students learn and submit work,
and admins manage the platform.

**Stack:** Next.js 15 (App Router), NestJS 11, PostgreSQL 16, Prisma ORM, JWT auth, Tailwind CSS.

## Features

- **Authentication:** register, login, bcrypt password hashing, JWT, session restore on refresh
- **Role-based access control:** Admin, Instructor, Student (enforced on the server with guards and in the UI)
- **Student:** browse and filter courses, enroll, lesson viewer with progress tracking, assignments with file upload, reviews, grades
- **Instructor:** create courses and lessons, reorder lessons, file uploads, assignments, grading, student progress, submit courses for approval
- **Admin:** platform statistics, user management (role, activate/deactivate), categories, course approval workflow
- **Course workflow:** Draft, Pending, Published, Archived (only admins can publish)
- **API docs:** Swagger UI at `/docs`

## Setup

### 1. Database

```bash
docker run --name eduflow-postgres \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=eduflow_db \
  -p 5432:5432 -d postgres:16-alpine


### 2. Backend

```bash
cd backend
cp .env.example .env       
npm install
npx prisma migrate deploy  
npm run seed               
npm run start:dev
```

API: http://localhost:4000/api , 
Swagger: http://localhost:4000/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local  # Windows PowerShell: Copy-Item .env.example .env.local
npm install
npm run dev
```

App: http://localhost:3000


## Database design

Nine entities: `User`, `Category`, `Course`, `Lesson`, `Enrollment`, `LessonProgress`,
`Assignment`, `Submission`, `Review`. `User` to `Course` is many-to-many through `Enrollment`;
`Course` has many `Lesson`, `Assignment` and `Review`; `Submission` links a student to an assignment.
Unique constraints prevent duplicate enrollments, submissions and reviews.


## Git workflow

`main` holds stable releases, `dev` is the integration branch, and every change is built on a
`feature/*`, `fix/*` or `chore/*` branch created from `dev` and merged through a Pull Request.
Commits follow Conventional Commits.
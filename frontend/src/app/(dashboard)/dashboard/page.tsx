'use client'

import { useAuth } from "@/context/AuthContext"
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import InstructorDashboard from '@/components/dashboard/InstructorDashboard'

const SUBTITLE = {
  STUDENT: 'Pick up where you left off.',
  INSTRUCTOR: 'Manage your courses, students and grading.',
  ADMIN: 'Platform administration.',
} as const

export default function DashboardPage(){
    const { user } = useAuth()
    if(!user) return null

    return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
        <p className="mt-1 text-slate-600">{SUBTITLE[user.role]}</p>
      </div>

      {user.role === 'STUDENT' && <StudentDashboard />}
      {user.role === 'INSTRUCTOR' && <InstructorDashboard />}
      {user.role === 'ADMIN' && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Admin tools are coming in the next step.
        </div>
      )}
    </div>
  );
}
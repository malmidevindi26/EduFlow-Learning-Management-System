'use client'

import { useAuth } from "@/context/AuthContext"
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import InstructorDashboard from '@/components/dashboard/InstructorDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CAT = {
  STUDENT: { href: '/courses', label: 'Browse courses', text: 'Pick up where you left off, or find your next course.' },
  INSTRUCTOR: { href: '/instructor/courses/new', label: 'Create a course', text: 'Manage your courses, students and grading.' },
  ADMIN: { href: '/admin/courses', label: 'Review courses', text: 'Keep the platform healthy and approve new courses.' },
} as const

function greeting(){
  const hour = new Date().getHours()
  if(hour < 12) return 'Good morning'
  if(hour < 18) return 'Good afternoon'
  return 'Good evening'
}


export default function DashboardPage(){
    const { user } = useAuth()
    if(!user) return null
    const cta = CAT[user.role]

    return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-soft">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {greeting()}, {user.name.split(' ')[0]}
            </h1>
            <p className="mt-1 text-blue-100">{cta.text}</p>
          </div>
          <Link
            href={cta.href}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow transition hover:bg-blue-50"
          >
            {cta.label} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {user.role === 'STUDENT' && <StudentDashboard />}
      {user.role === 'INSTRUCTOR' && <InstructorDashboard />}
      {user.role === 'ADMIN' && <AdminDashboard />}
    </div>
  );
}
'use client';

import { BookOpen, ClipboardCheck, Plus, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { api, getErrorMessage } from '@/lib/api';
import type { InstructorStats, MyCourse } from '@/lib/types';
import { primaryBtn } from '@/lib/ui';

export default function InstructorDashboard() {
  const [stats, setStats] = useState<InstructorStats | null>(null)
  const [courses, setCourses] = useState<MyCourse[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get<InstructorStats>('/instructor/stats'), api.get<MyCourse[]>('/courses/mine')])
      .then(([s, c]) => {
        setStats(s.data)
        setCourses(c.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
  if (!stats || !courses) return <p className="text-slate-500">Loading your dashboard...</p>

  const cards = [
    { label: 'My courses', value: stats.totalCourses, icon: BookOpen },
    { label: 'Students', value: stats.totalStudents, icon: Users },
    { label: 'To grade', value: stats.pendingGrading, icon: ClipboardCheck },
    {
      label: `Rating (${stats.totalReviews} reviews)`,
      value: stats.averageRating ?? '-',
      icon: Star,
    },
  ]

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">My courses</h2>
          <Link href="/instructor/courses/new" className={`${primaryBtn} flex items-center gap-1`}>
            <Plus size={16} /> New course
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-medium">You have not created any course yet</p>
            <Link href="/instructor/courses/new" className={`${primaryBtn} mt-4 inline-block`}>
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {courses.map((c) => (
              <div key={c.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{c.title}</h3>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {c.category.name} &middot; {c._count.lessons} lesson{c._count.lessons === 1 ? '' : 's'}
                </p>
                <div className="mt-4 flex gap-3">
                  <Link href={`/instructor/courses/${c.id}`} className={primaryBtn}>
                    Manage
                  </Link>
                  {c.status === 'PUBLISHED' && (
                    <Link
                      href={`/courses/${c.id}`}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                    >
                      View public page
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
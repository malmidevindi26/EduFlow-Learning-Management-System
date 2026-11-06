'use client';

import { Award, BookOpen, CheckCircle2, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProgressBar from '@/components/ProgressBar';
import { api, getErrorMessage } from '@/lib/api';
import type { EnrollmentItem, MySubmission } from '@/lib/types';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';
import StatCard, { STAT_TONES } from '@/components/ui/StatCard';

export default function StudentDashboard(){
    const [enrollments, setEnrollments] = useState<EnrollmentItem[] | null>(null)
    const [submissions, setSubmissions] = useState<MySubmission[]>([])
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([
            api.get<EnrollmentItem[]>('/enrollments/my'),
            api.get<MySubmission[]>('/submissions/my'),
        ])

          .then(([e, s]) => {
            setEnrollments(e.data)
            setSubmissions(s.data)
          })
          .catch((error) => setError(getErrorMessage(error)))
    }, [])

    if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
    if (!enrollments) return <DashboardSkeleton />
    const completed = enrollments.filter((e) => e.status === 'COMPLETED').length
    const graded = submissions.filter((s) => s.status === 'GRADED')

    const stats = [
           { label: 'Enrolled courses', value: enrollments.length, icon: BookOpen },
           { label: 'Completed', value: completed, icon: CheckCircle2 },
           { label: 'Submissions', value: submissions.length, icon: ClipboardList },
           { label: 'Graded', value: graded.length, icon: Award },
    ]

    return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))} */}
        {stats.map(({ label, value, icon }, i) => (
          <StatCard key={label} label={label} value={value} icon={icon} tone={STAT_TONES[i % STAT_TONES.length]} />
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">My courses</h2>
        {enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="font-medium">You have not enrolled in any course yet</p>
            <Link
              href="/courses"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {enrollments.map((e) => (
              <div key={e.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">{e.course.category.name}</p>
                <Link
                    href={`/courses/${e.course.id}`}
                    title={e.course.title}
                    className="mt-1 line-clamp-2 font-semibold hover:text-blue-600"
                >
                    {e.course.title}
                </Link>
                <p className="text-xs text-slate-500">By {e.course.instructor.name}</p>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-600">
                    <span>
                      {e.completedLessons} / {e.totalLessons} lessons
                    </span>
                    <span>{e.status === 'COMPLETED' ? 'Completed' : `${e.progress}%`}</span>
                  </div>
                  <ProgressBar value={e.progress} />
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/learn/${e.course.id}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {e.progress === 0 ? 'Start' : e.status === 'COMPLETED' ? 'Review' : 'Continue'}
                  </Link>
                  <Link
                    href={`/learn/${e.course.id}/assignments`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Assignments
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {graded.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Recent grades</h2>
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {graded.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium">{s.assignment.title}</p>
                  <p className="text-xs text-slate-500">{s.assignment.course.title}</p>
                  {s.feedback && <p className="mt-1 text-sm text-slate-600">{s.feedback}</p>}
                </div>
                <p className="shrink-0 text-lg font-bold text-emerald-600">
                  {s.marks} / {s.assignment.maxMarks}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import CourseForm from '@/components/instructor/CourseForm';
import { useManagedCourse } from '@/context/InstructorCourseContext';
import { api, getErrorMessage } from '@/lib/api';
import type { CourseStatus } from '@/lib/types';
import { primaryBtn, secondaryBtn } from '@/lib/ui';

const ACTIONS: Record<CourseStatus, { to: CourseStatus; label: string; primary?: boolean }[]> = {
    DRAFT: [
      { to: 'PENDING', label: 'Submit for approval', primary: true },
      { to: 'ARCHIVED', label: 'Archive' },
    ],
    PENDING: [
      { to: 'DRAFT', label: 'Withdraw to draft' },
      { to: 'ARCHIVED', label: 'Archive' },
    ],
    PUBLISHED: [{ to: 'ARCHIVED', label: 'Archive' }],
    ARCHIVED: [{ to: 'DRAFT', label: 'Restore to draft', primary: true }],
}

const HINT: Record<CourseStatus, string> = {
  DRAFT: 'Only you can see this course. Add at least one lesson, then submit it for admin approval.',
  PENDING: 'Waiting for an admin to review and publish this course.',
  PUBLISHED: 'This course is live in the public catalogue.',
  ARCHIVED: 'This course is hidden. Restore it to draft to work on it again.',
};

export default function CourseDetailsTab(){
    const{ course, reload } = useManagedCourse()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    async function change(to: CourseStatus){
        if(to === 'ARCHIVED' && !window.confirm('Archive this course? It will disappear from the public catalogue.')){
            return
        }
    setBusy(true)
    setError('')
    try{
        await api.patch(`/courses/${course.id}/status`, { status: to })
        await reload()
    }catch(error){
        setError(getErrorMessage(error))
    }finally{
        setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Publishing</h2>
        <p className="mt-1 text-sm text-slate-600">{HINT[course.status]}</p>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          {ACTIONS[course.status].map((a) => (
            <button
              key={a.to}
              onClick={() => change(a.to)}
              disabled={busy}
              className={a.primary ? primaryBtn : secondaryBtn}
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Course details</h2>
        <CourseForm initial={course} onSaved={() => reload()} />
      </section>
    </div>
  );
}
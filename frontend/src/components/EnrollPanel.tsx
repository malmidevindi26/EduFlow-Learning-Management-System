'use client'

import { BarChart3, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ProgressBar from '@/components/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import { api, getErrorMessage } from '@/lib/api';

export default function EnrollPanel({
    courseId,
    lessonCount,
    level,
    category,
}: {
    courseId: string
    lessonCount: number
    level: string
    category: string
}) {
    const { user, loading: authLoading } = useAuth()
    const { enrollment, loading, refresh } = useEnrollment(courseId)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    async function enroll(){
        setBusy(true)
        setError('')
        try {
            await api.post(`/courses/${courseId}/enroll`)
            await refresh()
        } catch (err) {
            setError(getErrorMessage(err))
        }finally{
            setBusy(false)
        }
    } 

    async function unenroll() {
        if(!window.confirm('Unenroll from this course? You progress is kept if you enroll again.')) return
        setBusy(true)
        setError('')
        try {
            await api.delete(`/courses/${courseId}/enroll`)
            await refresh()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    const primary =
    'block w-full rounded-lg bg-blue-600 py-2.5 text-center font-medium text-white transition hover:bg-blue-700 disabled:opacity-50';

    let action;
    if(authLoading || loading){
        action = <div className="h-10 animate-pulse rounded-lg bg-slate-200" />;
    }else if (!user){
         action = (
          <>
            <p className="mb-3 text-sm text-slate-600">Log in as a student to enroll in this course.</p>
            <Link href="/login" className={primary}>
                 Log in to enroll
            </Link>
          </>
        );
    } else if (user.role !== 'STUDENT') {
         action = (
           <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              You are logged in as {user.role.toLowerCase()}. Only students can enroll in courses.
           </p>
          );
    } else if (enrollment){
        action = (
          <>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">
                {enrollment.status === 'COMPLETED' ? 'Completed' : 'Your progress'}
              </span>
              <span className="text-slate-600">{enrollment.progress}%</span>
            </div>
            <ProgressBar value={enrollment.progress} />
            <p className="mt-1 text-xs text-slate-500">
               {enrollment.completedLessons} of {enrollment.totalLessons} lessons done
            </p>
            <Link href={`/learn/${courseId}`} className={`${primary} mt-4`}>
               {enrollment.progress === 0 ? 'Start learning' : 'Continue learning'}
            </Link>
            <button
               onClick={unenroll}
               disabled={busy}
               className="mt-3 w-full text-center text-xs text-slate-500 hover:text-red-600"
            >
                Unenroll
            </button>
          </>
        );
    }else {
        action = (
         <button onClick={enroll} disabled={busy} className={primary}>
            {busy ? 'Enrolling...' : 'Enroll now'}
        </button>
        );
    }

    return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {action}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
        <li className="flex items-center gap-3">
          <BookOpen size={16} className="text-blue-600" /> {lessonCount} lessons
        </li>
        <li className="flex items-center gap-3">
          <BarChart3 size={16} className="text-blue-600" /> {level} level
        </li>
        <li className="flex items-center gap-3">
          <Layers size={16} className="text-blue-600" /> {category}
        </li>
      </ul>
    </div>
   );
}
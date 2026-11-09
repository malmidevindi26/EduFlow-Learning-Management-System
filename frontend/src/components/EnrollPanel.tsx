'use client'

import { BarChart3, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ProgressBar from '@/components/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import { api, getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import Spinner from './ui/Spinner';
import { cardClass, primaryBtn } from '@/lib/ui';

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
    const confirm = useConfirm()

    async function enroll(){
        setBusy(true)
        setError('')
        try {
            await api.post(`/courses/${courseId}/enroll`)
            await refresh()
            toast.success('You are enrolled. Happy learning!')
        } catch (err) {
            setError(getErrorMessage(err))
        }finally{
            setBusy(false)
        }
    } 

    async function unenroll() {
        const ok = await confirm({
          title: 'Unenroll from this course?',
          message: 'Your progress is kept if you enroll again.',
          confirmLabel: 'Unenroll',
          danger: true
        })
        if(!ok) return
        setBusy(true)
        setError('')
        try {
            await api.delete(`/courses/${courseId}/enroll`)
            await refresh()
            toast.success('You have been unenrolled');
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    const block = `${primaryBtn} w-full py-3`

  let action;
  if (authLoading || loading) {
    action = <div className="h-12 animate-pulse rounded-xl bg-slate-200" />;
  } else if (!user) {
    action = (
      <>
        <p className="mb-3 text-sm text-slate-600">Log in as a student to enroll in this course.</p>
        <Link href="/login" className={block}>
          Log in to enroll
        </Link>
        <p className="mt-3 text-center text-xs text-slate-500">
          No account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Register free
          </Link>
        </p>
      </>
    );
  } else if (user.role !== 'STUDENT') {
    action = (
      <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        You are logged in as {user.role.toLowerCase()}. Only students can enroll in courses.
      </p>
    );
  } else if (enrollment) {
    action = (
      <>
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="font-medium">{enrollment.status === 'COMPLETED' ? 'Completed' : 'Your progress'}</span>
          <span className="text-slate-600">{enrollment.progress}%</span>
        </div>
        <ProgressBar value={enrollment.progress} />
        <p className="mt-1.5 text-xs text-slate-500">
          {enrollment.completedLessons} of {enrollment.totalLessons} lessons done
        </p>
        <Link href={`/learn/${courseId}`} className={`${block} mt-4`}>
          {enrollment.progress === 0 ? 'Start learning' : 'Continue learning'}
        </Link>
        <button
          onClick={unenroll}
          disabled={busy}
          className="mt-3 w-full text-center text-xs text-slate-500 transition hover:text-red-600"
        >
          Unenroll
        </button>
      </>
    );
  } else {
    action = (
      <button onClick={enroll} disabled={busy} className={block}>
        {busy && <Spinner />} {busy ? 'Enrolling...' : 'Enroll now'}
      </button>
    );
  }

  return (
    <div className={`${cardClass} sticky top-24 p-6`}>
      {action}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

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
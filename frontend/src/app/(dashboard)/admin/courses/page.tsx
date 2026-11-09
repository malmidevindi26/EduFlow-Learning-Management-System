'use client';

import { ChevronDown, ChevronUp, CheckCircle2  } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { api, getErrorMessage } from '@/lib/api';
import type { Course, CourseDetails, CourseStatus, Paginated } from '@/lib/types';
import { primaryBtn, secondaryBtn } from '@/lib/ui';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

type Row = Course & { _count?: { lessons: number } }

interface Action {
    to: CourseStatus
    label: string
    primary?: boolean
    confirm?: string
}

function CourseRow({
    course,
    actions,
    onChanged,
}: {
    course: Row
    actions: Action[]
    onChanged: () => Promise<void>
}){
    const [open, setOpen] = useState(false)
    const [details, setDeatils] = useState<CourseDetails | null>(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const confirm = useConfirm()

    async function toggle(){
        const next = !open
        setOpen(next)
        if(next && !details){
            try {
                const res = await api.get<CourseDetails>(`/courses/${course.id}`)
                setDeatils(res.data)
            } catch (error) {
                setError(getErrorMessage(error))
            }
        }
    }

    async function change(action: Action){
        if(action.confirm){
          const ok = await confirm({
            title: 'Please confirm',
            message: action.confirm,
            confirmLabel: action.label,
            danger: action.to === 'ARCHIVED',
          })

          if(!ok) return
        }
        setBusy(true)
        setError('')
        try {
            await api.patch(`/courses/${course.id}/status`, { status: action.to })
            await onChanged()
        } catch (error) {
            setError(getErrorMessage(error))
            setBusy(false)
        }
    }

    return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 title={course.title} className="line-clamp-1 max-w-md font-semibold">{course.title}</h3>
            <StatusBadge status={course.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            By {course.instructor.name} &middot; {course.category.name}
            {course._count && <> &middot; {course._count.lessons} lesson{course._count.lessons === 1 ? '' : 's'}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {course.status === 'PUBLISHED' && (
            <Link href={`/courses/${course.id}`} className={secondaryBtn}>
              Public page
            </Link>
          )}
          {actions.map((a) => (
            <button key={a.to} disabled={busy} onClick={() => change(a)} className={a.primary ? primaryBtn : secondaryBtn}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={toggle} className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {open ? 'Hide' : 'Preview'}
      </button>

      {open && (
        <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
          {!details ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <>
              <p className="whitespace-pre-line text-slate-700">{details.description}</p>
              <p className="mt-3 font-medium">Lessons</p>
              {details.lessons.length === 0 ? (
                <p className="text-slate-500">No lessons.</p>
              ) : (
                <ol className="mt-1 list-inside list-decimal text-slate-600">
                  {details.lessons.map((l) => (
                    <li key={l.id}>{l.title}</li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export default function AdminCoursesPage(){
    const [tab, setTab] = useState<'pending' | 'published'>('pending')
    const [pending, setPending] = useState<Row[] | null>(null)
    const [published, setPublished] = useState<Row[] | null>(null)
    const [error, setError] = useState('')
    
    const load = useCallback(async () => {
        try {
            const [p, pub] = await Promise.all([
                api.get<Row[]>('/courses/pending'),
                api.get<Paginated<Row>>('/courses', { params: { limit: 50, sort: 'newest' } }),
            ])
            setPending(p.data)
            setPublished(pub.data.items)
            setError('')
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const tabClass = (active: boolean) => 
        `border-b-2 px-4 py-2 text-sm font-medium ${
         active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
        }`

    const list = tab === 'pending' ? pending: published

    return (
    <div className="space-y-5">
      <div className="flex border-b border-slate-200">
        <button onClick={() => setTab('pending')} className={tabClass(tab === 'pending')}>
          Pending approval ({pending?.length ?? 0})
        </button>
        <button onClick={() => setTab('published')} className={tabClass(tab === 'published')}>
          Published ({published?.length ?? 0})
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {!list ? (
        <p className="text-slate-500">Loading courses...</p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up"
          text="No courses are waiting for approval."
        />
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <CourseRow
              key={c.id}
              course={c}
              onChanged={load}
              actions={
                tab === 'pending'
                  ? [
                      { to: 'PUBLISHED', label: 'Approve and publish', primary: true },
                      { to: 'DRAFT', label: 'Send back to draft', confirm: 'Send this course back to the instructor as a draft?' },
                      { to: 'ARCHIVED', label: 'Archive', confirm: 'Archive this course?' },
                    ]
                  : [
                      { to: 'DRAFT', label: 'Unpublish', confirm: 'Unpublish this course? It will leave the public catalogue.' },
                      { to: 'ARCHIVED', label: 'Archive', confirm: 'Archive this course?' },
                    ]
              }
            />
          ))}
        </div>
      )}

      {tab === 'published' && published && published.length >= 50 && (
        <p className="text-center text-xs text-slate-500">Showing the latest 50 published courses.</p>
      )}
    </div>
  );
}
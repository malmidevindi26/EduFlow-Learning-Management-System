'use client';

import { Clock, Pencil, Plus, Trash2, ClipboardList  } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AssignmentForm from '@/components/instructor/AssignmentForm';
import { useManagedCourse } from '@/context/InstructorCourseContext';
import { api, getErrorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/date';
import type { Assignment } from '@/lib/types';
import { primaryBtn, secondaryBtn } from '@/lib/ui';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

export default function AssignmentsTab(){
    const { course } = useManagedCourse();
    const [assignments, setAssignments] = useState<Assignment[] | null>(null);
    const [editing, setEditing] = useState<Assignment | 'new' | null>(null);
    const [error, setError] = useState('');
    const confirm = useConfirm()

    const load = useCallback(async () => {
        try {
            const res = await api.get<Assignment[]>(`/courses/${course.id}/assignments`)
            setAssignments(res.data)
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }, [course.id])

    useEffect(() => {
        load()
    }, [load])

    async function remove(a: Assignment){
      const ok = await confirm({
        title: `Delete "${a.title}"?`,
        message: 'All submission will be deleted.',
        confirmLabel: 'Deleted assignemnt',
        danger: true
      })
      if(!ok) return

        try {
            await api.delete(`/assignments/${a.id}`)
            await load()
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    async function done(){
        await load()
        setEditing(null)
    }

    return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Assignments</h2>
        {!editing && (
          <button onClick={() => setEditing('new')} className={`${primaryBtn} flex items-center gap-1`}>
            <Plus size={16} /> New assignment
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {editing && (
        <AssignmentForm
          key={editing === 'new' ? 'new' : editing.id}
          courseId={course.id}
          assignment={editing === 'new' ? undefined : editing}
          onDone={done}
          onCancel={() => setEditing(null)}
        />
      )}

      {!assignments ? (
        <p className="text-slate-500">Loading...</p>
      ) : assignments.length === 0 ? (
         <EmptyState
           icon={ClipboardList}
           title="No assignments yet"
           text="Create one for your students."
         />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <Clock size={14} /> Due {formatDateTime(a.dueDate)} &middot; {a.maxMarks} marks
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/instructor/courses/${course.id}/assignments/${a.id}`} className={primaryBtn}>
                    Submissions
                  </Link>
                  <button onClick={() => setEditing(a)} className={`${secondaryBtn} flex items-center gap-1`}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => remove(a)} className={`${secondaryBtn} text-red-600`} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{a.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
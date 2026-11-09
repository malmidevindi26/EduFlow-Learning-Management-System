'use client';

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, BookOpen } from 'lucide-react';
import { useState } from 'react';
import LessonForm from '@/components/instructor/LessonForm';
import { useManagedCourse } from '@/context/InstructorCourseContext';
import { api, getErrorMessage } from '@/lib/api';
import type { LessonFull } from '@/lib/types';
import { primaryBtn } from '@/lib/ui';
import Tooltip from '@/components/ui/Tooltip';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

export default function LessonsTab(){
    const { course, reload } = useManagedCourse();
    const [editing, setEditing] = useState<LessonFull | 'new' | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const confirm = useConfirm()

    const lessons = [...course.lessons].sort((a, b) => a.position - b.position)

    async function edit(id: string){
        setError('')
        try{
            const res = await api.get<LessonFull>(`/lessons/${id}/content`)
            setEditing(res.data)
        }catch(err){
            setError(getErrorMessage(err))
        }
    }

    async function remove(id: string, title: string){
       const ok = await confirm({
        title: `Delete lesson "${title}"?`,
        message: 'Students progress on it is removed too.',
        confirmLabel: 'Delete',
        danger: true
       })

       if(!ok) return

       setBusy(true)
        setError('')
        try {
            await api.delete(`/lessons/${id}`);
            await reload();
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    async function move(index: number, direction: -1 | 1){
        const a = lessons[index]
        const b = lessons[index + direction]
        if(!a || !b) return
        setBusy(true)
        setError('')
        try {
            await Promise.all([
              api.patch(`/lessons/${a.id}`, { position: b.position }),
              api.patch(`/lessons/${b.id}`, { position: a.position }),
            ]);
      await reload();
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    async function done(){
        await reload()
        setEditing(null)
    }

    const iconBtn = 'rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30'

    return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lessons ({lessons.length})</h2>
        {!editing && (
          <button onClick={() => setEditing('new')} className={`${primaryBtn} flex items-center gap-1`}>
            <Plus size={16} /> Add lesson
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {editing && (
        <LessonForm
          key={editing === 'new' ? 'new' : editing.id}
          courseId={course.id}
          lesson={editing === 'new' ? undefined : editing}
          onDone={done}
          onCancel={() => setEditing(null)}
        />
      )}

      {lessons.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons yet"
          text="Add the first lesson to get started."
        />
      ) : (
        <ol className="space-y-2">
          {lessons.map((l, i) => (
            <li key={l.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                {l.position}
              </span>
              <span title={l.title} className="min-w-0 flex-1 truncate text-sm font-medium">
                {l.title}
              </span>
              <Tooltip text="Move up">
                <button className={iconBtn} disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                  <ArrowUp size={16} />
                </button>
              </Tooltip>
              <Tooltip text="Move down">
                 <button className={iconBtn} disabled={busy || i === lessons.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                   <ArrowDown size={16} />
                 </button>
              </Tooltip>
              <Tooltip text="Edit lesson">
                 <button className={iconBtn} disabled={busy} onClick={() => edit(l.id)} aria-label="Edit lesson">
                    <Pencil size={16} />
                 </button>
              </Tooltip>
              <Tooltip text="Delete lesson">
                 <button className={`${iconBtn} hover:text-red-600`} disabled={busy} onClick={() => remove(l.id, l.title)} aria-label="Delete lesson">
                    <Trash2 size={16} />
                 </button>
              </Tooltip>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
'use client';

import { useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { toLocalInput } from '@/lib/date';
import type { Assignment } from '@/lib/types';
import { inputClass, labelClass, primaryBtn, secondaryBtn } from '@/lib/ui';
import CharCount from '@/components/ui/CharCount';

export default function AssignmentForm({
    courseId,
    assignment,
    onDone,
    onCancel
}: {
    courseId: string
    assignment?: Assignment
    onDone: () => Promise<void>
    onCancel: () => void
}) {
    const [title, setTitle] = useState(assignment?.title ?? '');
    const [description, setDescription] = useState(assignment?.description ?? '');
    const [dueDate, setDueDate] = useState(assignment ? toLocalInput(assignment.dueDate) : '');
    const [maxMarks, setMaxMarks] = useState(String(assignment?.maxMarks ?? 100));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: FormEvent){
        e.preventDefault()
        setError('')
        if(!dueDate){
            setError('Choose a due date')
            return
        }
        setBusy(true)
        try {
            const body = {
                title: title.trim(),
                description: description.trim(),
                dueDate: new Date(dueDate).toISOString(),
                maxMarks: Number(maxMarks)
            }
            if (assignment) await api.patch(`/assignments/${assignment.id}`, body);
            else await api.post(`/courses/${courseId}/assignments`, body);
            await onDone()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
      <h3 className="font-semibold">{assignment ? 'Edit assignment' : 'New assignment'}</h3>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <label className={labelClass}>
        Title
        <input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputClass} mt-1`} />
        <CharCount value={title} max={120} />
      </label>

      <label className={labelClass}>
        Description
        <textarea required rows={4} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} mt-1`} />
        <CharCount value={description} max={5000} /> 
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Due date
          <input type="datetime-local" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className={labelClass}>
          Maximum marks (1 to 1000)
          <input type="number" required min={1} max={1000} value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? 'Saving...' : 'Save assignment'}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancel
        </button>
      </div>
    </form>
  );
}
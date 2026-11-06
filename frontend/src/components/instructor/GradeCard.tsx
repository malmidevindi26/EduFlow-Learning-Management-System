'use client';

import { FileText } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/date';
import { fileHref } from '@/lib/files';
import type { SubmissionWithStudent } from '@/lib/types';
import { inputClass, labelClass, primaryBtn } from '@/lib/ui';
import DownloadButton from '@/components/DownloadButton';
import { toast } from 'sonner';

export default function GradeCard({
    submission,
    maxMarks,
    onGraded,
}: {
    submission: SubmissionWithStudent
    maxMarks: number
    onGraded: () => Promise<void>
}) {
    const [marks, setMarks] = useState(submission.marks?.toString() ?? '');
    const [feedback, setFeedback] = useState(submission.feedback ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const graded = submission.status === 'GRADED';

    async function handleSubmit(e: FormEvent){
        e.preventDefault()
        setError('')
        const value = Number(marks)
        if(!Number.isInteger(value) || value < 0 || value > maxMarks){
            setError(`Marks must be a whole number from 0 to ${maxMarks}`)
            return
        }
        setBusy(true)
        try {
            await api.patch(`/submissions/${submission.id}/grade`, {
              marks: value,
               feedback: feedback.trim() || undefined,
            });
            await onGraded();
            toast.success('Grade saved')
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{submission.student.name}</p>
          <p className="text-xs text-slate-500">{submission.student.email}</p>
        </div>
        <div className="flex gap-2 text-xs">
          {submission.isLate && (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 font-medium text-rose-700">Late</span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 font-medium ${
              graded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {graded ? 'Graded' : 'Needs grading'}
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">Submitted {formatDateTime(submission.submittedAt)}</p>

      <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
        {submission.answerText ? (
          <p className="whitespace-pre-line">{submission.answerText}</p>
        ) : (
          <p className="text-slate-400">No written answer</p>
        )}
        {submission.fileUrl && (
          <DownloadButton
            path={submission.fileUrl}
            label="Download attached file"
            className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
        <label className={labelClass}>
          Marks / {maxMarks}
          <input type="number" required min={0} max={maxMarks} value={marks} onChange={(e) => setMarks(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className={labelClass}>
          Feedback
          <input maxLength={2000} value={feedback} onChange={(e) => setFeedback(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? 'Saving...' : graded ? 'Update grade' : 'Save grade'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
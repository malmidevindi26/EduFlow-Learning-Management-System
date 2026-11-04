'use client'

import { AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { fileHref, uploadFile } from '@/lib/files';
import type { Assignment, Submission } from '@/lib/types';

const MAX_SIZE = 10 * 1024 * 1024;

export default function AssignmentCard({
    assignment,
    submission,
    onSubmitted,
}: {
    assignment: Assignment
    submission?: Submission
    onSubmitted: () => Promise<void>
}) {
    const [answer, setAnswer] = useState(submission?.answerText ?? '')
    const [file, setFile] = useState<File | null>(null)
    const [editing, setEditing] = useState(!submission)
    const [busy, setBusy] = useState(false)
    const [error, setError ] = useState('')

    const graded = submission?.status === 'GRADED'
    const due = new Date(assignment.dueDate)
    const overdue = due < new Date()

    async function handleSubmit(e: FormEvent){
        e.preventDefault()
        setError('')

        if(!answer.trim() && !file && !submission?.fileUrl){
            setError('Write an answer or attach a file')
            return
        }
        if(file && file.size > MAX_SIZE){
            setError('File is too large (max 10 MB)')
            return
        }

        setBusy(true)
        try {
            let fileUrl = submission?.fileUrl ?? undefined
            if(file) fileUrl = (await uploadFile(file)).url

            await api.post(`/assignments/${assignment.id}/submit`, {
                answerText: answer.trim() || undefined,
                fileUrl
            })
            setFile(null)
            setEditing(false)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    let badge;
    if (graded) {
      badge = (
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={14} /> Graded
        </span>
      );
    } else if (submission) {
      badge = (
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {submission.isLate ? 'Submitted (late)' : 'Submitted'}
        </span>
      );
    } else if (overdue) {
       badge = (
        <span className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
          <AlertTriangle size={14} /> Overdue
        </span>
      );
    } else {
       badge = (
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          Not submitted
        </span>
       );
    }


    return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{assignment.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <Clock size={14} /> Due {due.toLocaleString()} &middot; {assignment.maxMarks} marks
          </p>
        </div>
        {badge}
      </div>

      <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{assignment.description}</p>

      {graded && submission && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm">
          <p className="font-semibold text-emerald-800">
            Marks: {submission.marks} / {assignment.maxMarks}
          </p>
          {submission.feedback && <p className="mt-1 text-emerald-900">{submission.feedback}</p>}
        </div>
      )}

      {submission && !editing && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="mb-1 text-xs text-slate-500">
            Submitted {new Date(submission.submittedAt).toLocaleString()}
          </p>
          {submission.answerText && <p className="whitespace-pre-line">{submission.answerText}</p>}
          {submission.fileUrl && (
            <a
              href={fileHref(submission.fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <FileText size={14} /> Attached file
            </a>
          )}
          {!graded && (
            <button
              onClick={() => setEditing(true)}
              className="mt-3 block text-sm font-medium text-blue-600 hover:underline"
            >
              Edit submission
            </button>
          )}
        </div>
      )}

      {!graded && editing && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {overdue && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              The due date has passed. You can still submit, but it will be marked as late.
            </p>
          )}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            maxLength={10000}
            placeholder="Write your answer..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <div>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Optional file, max 10 MB (pdf, images, zip, txt, Office files)
              {submission?.fileUrl && !file && '. Your current file is kept unless you choose a new one.'}
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'Submitting...' : submission ? 'Update submission' : 'Submit'}
            </button>
            {submission && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
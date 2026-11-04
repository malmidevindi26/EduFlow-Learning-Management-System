'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import GradeCard from '@/components/instructor/GradeCard';
import { api, getErrorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/date';
import type { Assignment, SubmissionWithStudent } from '@/lib/types';

export default function SubmissionsPage(){
    const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionWithStudent[] | null>(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try{
            const [list, subs] = await Promise.all([
                 api.get<Assignment[]>(`/courses/${courseId}/assignments`),
                 api.get<SubmissionWithStudent[]>(`/assignments/${assignmentId}/submissions`),
            ])
            const found = list.data.find((a) => a.id === assignmentId) ?? null
            if(!found){
                setError('Assignment not found')
                return
            }
            setAssignment(found)
            setSubmissions(subs.data)
        }catch (err){
            setError(getErrorMessage(err))
        }
    }, [courseId, assignment])

    useEffect(() => {
        load()
    }, [load])

    if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
    if (!assignment || !submissions) return <p className="text-slate-500">Loading submissions...</p>;

    const graded = submissions.filter((s) => s.status === 'GRADED').length

    return (
    <div className="space-y-5">
      <Link
        href={`/instructor/courses/${courseId}/assignments`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600"
      >
        <ChevronLeft size={16} /> All assignments
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{assignment.title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Due {formatDateTime(assignment.dueDate)} &middot; {assignment.maxMarks} marks
        </p>
        <p className="mt-3 text-sm text-slate-700">
          {submissions.length} submission{submissions.length === 1 ? '' : 's'}, {graded} graded
        </p>
      </div>

      {submissions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No submissions yet.
        </p>
      ) : (
        submissions.map((s) => (
          <GradeCard key={s.id} submission={s} maxMarks={assignment.maxMarks} onGraded={load} />
        ))
      )}
    </div>
  );
}


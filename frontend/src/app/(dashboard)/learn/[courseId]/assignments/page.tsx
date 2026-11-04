'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AssignmentCard from '@/components/AssignmentCard';
import LearnHeader from '@/components/LearnHeader';
import { useLearnCourse } from '@/hooks/useLearnCourse';
import { api, getErrorMessage } from '@/lib/api';
import type { Assignment, MySubmission } from '@/lib/types';


export default function AssignmentsPage(){
    const { courseId } = useParams<{ courseId: string }>()
    const { course, progress, error: courseError } = useLearnCourse(courseId)

    const [assignments, setAssignments] = useState<Assignment[] | null>(null)
    const [ submissions, setSubmissions ] = useState<MySubmission[]>([])
    const [error, setError] = useState('')

    const load =  useCallback(async () => {
        try {
            const [a, s] = await Promise.all([
                api.get<Assignment[]>(`/courses/${courseId}/assignments`),
                api.get<MySubmission[]>('/submissions/my'),
            ])
            setAssignments(a.data)
            setSubmissions(s.data)
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }, [courseId])

    useEffect(() => {
        load()
    }, [load])

    const problem = courseError || error
    if( problem){
        return(
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-red-600">{problem}</p>
            <Link href={`/courses/${courseId}`} className="mt-4 inline-block text-blue-600 hover:underline">
               Go to the course page
            </Link>
          </div>
        )
    }

    if (!course || !assignments) return <p className="text-slate-500">Loading assignments...</p>;

    const byAssignment = new Map(submissions.map((s) => [s.assignmentId, s]));

    return (
    <div>
      <LearnHeader courseId={courseId} title={course.title} progress={progress} active="assignments" />

      {assignments.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow">
          No assignments for this course yet.
        </p>
      ) : (
        <div className="space-y-5">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              submission={byAssignment.get(a.id)}
              onSubmitted={load}
            />
          ))}
        </div>
      )}
    </div>
   );

}
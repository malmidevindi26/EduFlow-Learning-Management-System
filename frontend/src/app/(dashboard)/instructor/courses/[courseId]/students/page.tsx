'use client';

import { useEffect, useState } from 'react';
import ProgressBar from '@/components/ProgressBar';
import { useManagedCourse } from '@/context/InstructorCourseContext';
import { api, getErrorMessage } from '@/lib/api';
import type { CourseStudent } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function StudentsTab(){
    const { course } = useManagedCourse()
    const [students, setStudents] = useState<CourseStudent[] | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api  
          .get<CourseStudent[]>(`/courses/${course.id}/students`)
          .then((res) => setStudents(res.data))
          .catch((err) => setError(getErrorMessage(err)))
    }, [course.id])

    if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
    if (!students) return <p className="text-slate-500">Loading students...</p>

     return (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Enrolled students ({students.length})</h2>
            {students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students yet"
                text="Students appear here after they enroll."
              />
        ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.enrollmentId} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.student.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.student.name}</p>
                        <p className="truncate text-xs text-slate-500">{s.student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(s.enrolledAt).toLocaleDateString()}</td>
                  <td className="w-48 px-4 py-3">
                    <ProgressBar value={s.progress} />
                    <p className="mt-1 text-xs text-slate-500">
                      {s.completedLessons}/{s.totalLessons} lessons ({s.progress}%)
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.status === 'COMPLETED' ? 'Completed' : 'Active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

}
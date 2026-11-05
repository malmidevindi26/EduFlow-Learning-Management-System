'use client';

import { useEffect, useState } from 'react';
import ProgressBar from '@/components/ProgressBar';
import { useManagedCourse } from '@/context/InstructorCourseContext';
import { api, getErrorMessage } from '@/lib/api';
import type { CourseStudent } from '@/lib/types';

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
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No students have enrolled yet.
          </p>
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
                <tr key={s.enrollmentId}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.student.name}</p>
                    <p className="text-xs text-slate-500">{s.student.email}</p>
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
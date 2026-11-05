'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { InstructorCourseContext } from '@/context/InstructorCourseContext';
import { api, getErrorMessage } from '@/lib/api';
import type { ManagedCourse } from '@/lib/types';

export default function CourseManageLayout({ children }: { children: ReactNode }){
    const { courseId } = useParams<{ courseId: string }>();
    const pathname = usePathname();
    const { user } = useAuth();
    const [course, setCourse] = useState<ManagedCourse | null>(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            const res = await api.get<ManagedCourse>(`/courses/${courseId}`)
            setCourse(res.data)
            setError('')
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }, [courseId])

    useEffect(() => {
        load()
    }, [load])

    const problem = error || (course && user && course.instructorId !== user.id ? 'You can only manage your own course' : '')

    if(problem){
        return (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
             <p className="text-red-600">{problem}</p>
             <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
                 Back to dashboard
             </Link>
          </div>
        );
    }
    if(!course) return <p className='text-slate-500'>Loading course...</p>

    const base = `/instructor/courses/${course.id}`;
    const tabs = [
       { href: base, label: 'Details', exact: true },
       { href: `${base}/lessons`, label: 'Lessons' },
       { href: `${base}/assignments`, label: 'Assignments' },
       { href: `${base}/students`, label: 'Students' },
    ];

    return (
    <InstructorCourseContext.Provider value={{ course, reload: load }}>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">
        <ChevronLeft size={16} /> Dashboard
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <StatusBadge status={course.status} />
      </div>

      <div className="mb-6 mt-4 flex overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
                active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {children}
    </InstructorCourseContext.Provider>
  );
}
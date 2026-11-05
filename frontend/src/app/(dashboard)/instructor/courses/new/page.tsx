'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CourseForm from '@/components/instructor/CourseForm';

export default function NewCoursePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">
        <ChevronLeft size={16} /> Dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Create a course</h1>
      <p className="mt-1 text-sm text-slate-600">
        New courses start as drafts. Add lessons next, then submit for approval.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CourseForm onSaved={(id) => router.push(`/instructor/courses/${id}/lessons`)} />
      </div>
    </div>
  );
}
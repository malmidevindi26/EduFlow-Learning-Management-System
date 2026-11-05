import { ChevronLeft } from "lucide-react";
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import type { CourseProgress } from '@/lib/types';

export default function LearnHeader({
    courseId,
    title,
    progress,
    active,
}: {
    courseId: string
    title: string
    progress: CourseProgress | null
    active: 'lessons' | 'assignments'
}){
 const tab = (key: 'lessons' | 'assignments', href: string, label: string) => (
    <Link
      href={href}
      className={`border-b-2 px-4 py-2 text-sm font-medium ${
        active === key
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mb-6">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600"
      >
        <ChevronLeft size={16} /> Course page
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{title}</h1>

      {progress && (
        <div className="mt-3 max-w-md">
          <ProgressBar value={progress.progress} />
          <p className="mt-1 text-xs text-slate-500">
            {progress.completedLessons} of {progress.totalLessons} lessons done ({progress.progress}%)
          </p>
        </div>
      )}

      <div className="mt-4 flex border-b border-slate-200">
        {tab('lessons', `/learn/${courseId}`, 'Lessons')}
        {tab('assignments', `/learn/${courseId}/assignments`, 'Assignments')}
      </div>
    </div>
  );
}
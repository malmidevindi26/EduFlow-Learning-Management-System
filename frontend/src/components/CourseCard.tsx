import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/lib/types";
import Thumbnail from '@/components/ui/Thumbnail';

const levelStyle: Record<Course['level'], string> = {
    BEGINNER: 'bg-emerald-50 text-emerald-700',
    INTERMEDIATE: 'bg-amber-50 text-amber-700',
    ADVANCED: 'bg-rose-50 text-rose-700',
}

const gradients = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-500',
  'from-sky-500 to-cyan-600',
]

export default function CourseCard({ course }: { course: Course }){

    const gradient = gradients[course.title.charCodeAt(0) % gradients.length]

    return(
         <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <Thumbnail src={course.thumbnailUrl} title={course.title} gradient={gradient} />

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">{course.category.name}</span>
          <span className={`rounded-full px-2.5 py-0.5 font-medium ${levelStyle[course.level]}`}>
            {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
          </span>
        </div>

        <h3 title={course.title} className="line-clamp-2 font-semibold leading-snug transition group-hover:text-blue-600">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{course.description}</p>

        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {course.instructor.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-xs text-slate-500">{course.instructor.name}</span>
        </div>
      </div>
    </Link>
    )
}
import { BarChart3, BookOpen, ChevronLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/server-api';
import type { CourseDetails, ReviewsResponse } from '@/lib/types';

export default async function CourseDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    let course: CourseDetails
    try{
        course = await apiFetch<CourseDetails>(`/courses/${id}`)
    }catch(err){
        if(err instanceof ApiError && (err.status === 400 || err.status === 404)){
            notFound()
        }
        throw err
    }

    const reviews = await apiFetch<ReviewsResponse>(`/courses/${id}/reviews`).catch(() => null)
    const level = course.level.charAt(0) + course.level.slice(1).toLowerCase()

    return (
    <div>
      {/* Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-sm text-blue-200 hover:text-white"
          >
            <ChevronLeft size={16} /> All courses
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-white/15 px-3 py-1">{course.category.name}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{level}</span>
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold md:text-4xl">{course.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-100">
            <span>By {course.instructor.name}</span>
            {reviews && reviews.count > 0 && (
              <span className="text-amber-300">
                &#9733; {reviews.average} ({reviews.count} review{reviews.count === 1 ? '' : 's'})
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">About this course</h2>
            <p className="mt-3 whitespace-pre-line text-slate-700">{course.description}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Lessons ({course.lessons.length})</h2>
            {course.lessons.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No lessons yet.</p>
            ) : (
              <ol className="mt-4 space-y-2">
                {course.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                      {lesson.position}
                    </span>
                    {lesson.title}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Reviews</h2>
            {!reviews || reviews.items.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No reviews yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.items.map((review) => (
                  <li key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {review.user.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{review.user.name}</p>
                        <p className="text-xs text-amber-500">
                          {'★'.repeat(review.rating)}
                          <span className="text-slate-300">{'★'.repeat(5 - review.rating)}</span>
                        </p>
                      </div>
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-slate-600">{review.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Log in as a student to enroll in this course.</p>
            <Link
              href="/login"
              className="mt-4 block rounded-lg bg-blue-600 py-2.5 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Log in to enroll
            </Link>

            <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <BookOpen size={16} className="text-blue-600" /> {course.lessons.length} lessons
              </li>
              <li className="flex items-center gap-3">
                <BarChart3 size={16} className="text-blue-600" /> {level} level
              </li>
              <li className="flex items-center gap-3">
                <Layers size={16} className="text-blue-600" /> {course.category.name}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
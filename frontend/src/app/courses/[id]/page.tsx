import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EnrollPanel from '@/components/EnrollPanel';
import ReviewSection from '@/components/ReviewSection';
import { ApiError, apiFetch } from '@/lib/server-api';
import type { CourseDetails, ReviewsResponse } from '@/lib/types';

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let course: CourseDetails;
  try {
    course = await apiFetch<CourseDetails>(`/courses/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 404)) {
      notFound();
    }
    throw error;
  }

  const reviews = await apiFetch<ReviewsResponse>(`/courses/${id}/reviews`).catch(() => null);
  const level = course.level.charAt(0) + course.level.slice(1).toLowerCase();

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

          <ReviewSection courseId={course.id} reviews={reviews} />
        </div>

        {/* Sidebar */}
        <aside>
          <EnrollPanel
            courseId={course.id}
            lessonCount={course.lessons.length}
            level={level}
            category={course.category.name}
          />
        </aside>
      </div>
    </div>
  );
}
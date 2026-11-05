'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, Circle, FileText, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LearnHeader from '@/components/LearnHeader';
import { useLearnCourse } from '@/hooks/useLearnCourse';
import { api, getErrorMessage } from '@/lib/api';
import { fileHref } from '@/lib/files';
import type { CourseProgress, LessonContent } from '@/lib/types';
import { safeHref } from '@/lib/sanitize';
import DownloadButton from '@/components/DownloadButton';

export default function LearnPage(){
    const { courseId } = useParams<{ courseId: string }>()
    const { course, progress, setProgress, error } = useLearnCourse(courseId)

    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [lesson, setLesson] = useState<LessonContent | null>(null)
    const [loadingLesson, setLoadingLesson] = useState(false)
    const [lessonError, setLessonError] = useState('')
    const [marking, setMarking] = useState(false)

    //opem first unfiniched lesson once the course loads
    useEffect(() => {
        if (course && progress && selectedId === null) {
      const first =
        course.lessons.find((l) => !progress.completedLessonIds.includes(l.id)) ?? course.lessons[0];
      if (first) setSelectedId(first.id);
    }
    }, [course, progress, selectedId])

    // load the selected lesson's content
    useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoadingLesson(true);
    setLessonError('');
    api
      .get<LessonContent>(`/lessons/${selectedId}/content`)
      .then((res) => {
        if (!cancelled) setLesson(res.data);
      })
      .catch((err) => {
        if (!cancelled) setLessonError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingLesson(false);
      });
    return () => {
      cancelled = true;
     };
    }, [selectedId]);

    async function markComplete(){
        if(!lesson) return
        setMarking(true)
        try{
            const res = await api.post<{
                completedLessons: number
                totalLessons: number
                progress: number
                status: CourseProgress['status']
            }>(`/lessons/${lesson.id}/complete`)

            setProgress((prev) => 
            prev
              ? {
                ...prev,
                completedLessonIds: prev.completedLessonIds.includes(lesson.id)
                   ? prev.completedLessonIds
                   : [...prev.completedLessonIds, lesson.id],
                completedLessons: res.data.completedLessons,
                totalLessons: res.data.totalLessons,
                progress: res.data.progress,
                status: res.data.status,
              }
             : prev,
        )
        }catch(err){
            setLessonError(getErrorMessage(err))
        }finally{
            setMarking(false)
        }
    }

    if(error){
     return (
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-red-600">{error}</p>
        <p className="mt-2 text-sm text-slate-500">You need to be enrolled in this course as a student.</p>
        <Link href={`/courses/${courseId}`} className="mt-4 inline-block text-blue-600 hover:underline">
          Go to the course page
        </Link>
      </div>
     );
    }

    if (!course || !progress) return <p className="text-slate-500">Loading course...</p>;

    const lessons = course.lessons;
    const index = lessons.findIndex((l) => l.id === selectedId);
    const prev = index > 0 ? lessons[index - 1] : null;
    const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;
    const isDone = lesson ? progress.completedLessonIds.includes(lesson.id) : false;

     return (
    <div>
      <LearnHeader courseId={courseId} title={course.title} progress={progress} active="lessons" />

      {progress.status === 'COMPLETED' && (
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
          You completed this course.{' '}
          <Link href={`/courses/${courseId}#reviews`} className="font-medium underline">
            Leave a review
          </Link>
        </div>
      )}

      {lessons.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow">
          This course has no lessons yet.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          {/* Lesson list */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <ol className="space-y-1">
              {lessons.map((l) => {
                const done = progress.completedLessonIds.includes(l.id);
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => setSelectedId(l.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        l.id === selectedId ? 'bg-blue-50 font-medium text-blue-700' : 'hover:bg-slate-50'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                      ) : (
                        <Circle size={18} className="shrink-0 text-slate-300" />
                      )}
                      <span>
                        {l.position}. {l.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* Lesson content */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {loadingLesson || !lesson ? (
              lessonError ? (
                <p className="text-red-600">{lessonError}</p>
              ) : (
                <p className="text-slate-500">Loading lesson...</p>
              )
            ) : (
              <>
                <h2 className="text-xl font-bold">{lesson.title}</h2>
                <div className="mt-4 whitespace-pre-line text-slate-700">{lesson.content}</div>

                {(lesson.videoUrl || lesson.fileUrl) && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {safeHref(lesson.videoUrl) && (
                      <a
                        href={safeHref(lesson.videoUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                      >
                        <Video size={16} /> Watch video
                      </a>
                    )}
                    {lesson.fileUrl && (
                      <DownloadButton
                        path={lesson.fileUrl}
                        label="Download material"
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                      />
                    )}
                  </div>
                )}

                {lessonError && <p className="mt-4 text-sm text-red-600">{lessonError}</p>}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  <button
                    onClick={() => prev && setSelectedId(prev.id)}
                    disabled={!prev}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                      <CheckCircle2 size={18} /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={markComplete}
                      disabled={marking}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {marking ? 'Saving...' : 'Mark as complete'}
                    </button>
                  )}

                  <button
                    onClick={() => next && setSelectedId(next.id)}
                    disabled={!next}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
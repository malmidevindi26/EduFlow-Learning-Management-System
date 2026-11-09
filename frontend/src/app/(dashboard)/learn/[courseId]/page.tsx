'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Circle,
  ListChecks,
  Trophy,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DownloadButton from '@/components/DownloadButton';
import LearnHeader from '@/components/LearnHeader';
import Skeleton from '@/components/ui/Skeleton';
import { useLearnCourse } from '@/hooks/useLearnCourse';
import { api, getErrorMessage } from '@/lib/api';
import { safeHref } from '@/lib/sanitize';
import type { CourseProgress, LessonContent } from '@/lib/types';
import { cardClass, primaryBtn, secondaryBtn } from '@/lib/ui';

function LessonSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, progress, setProgress, error } = useLearnCourse(courseId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [lessonError, setLessonError] = useState('');
  const [marking, setMarking] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const lessons = course?.lessons ?? [];
  const index = lessons.findIndex((l) => l.id === selectedId);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;

  // Open the first unfinished lesson once the course loads
  useEffect(() => {
    if (course && progress && selectedId === null) {
      const first =
        course.lessons.find((l) => !progress.completedLessonIds.includes(l.id)) ?? course.lessons[0];
      if (first) setSelectedId(first.id);
    }
  }, [course, progress, selectedId]);

  // Load the selected lesson's full content
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Left / right arrow keys switch lessons
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'ArrowLeft' && prev) setSelectedId(prev.id);
      if (e.key === 'ArrowRight' && next) setSelectedId(next.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  async function markComplete(goNext: boolean) {
    if (!lesson) return;
    setMarking(true);
    setLessonError('');
    try {
      const res = await api.post<{
        completedLessons: number;
        totalLessons: number;
        progress: number;
        status: CourseProgress['status'];
      }>(`/lessons/${lesson.id}/complete`);

      setProgress((prevState) =>
        prevState
          ? {
              ...prevState,
              completedLessonIds: prevState.completedLessonIds.includes(lesson.id)
                ? prevState.completedLessonIds
                : [...prevState.completedLessonIds, lesson.id],
              completedLessons: res.data.completedLessons,
              totalLessons: res.data.totalLessons,
              progress: res.data.progress,
              status: res.data.status,
            }
          : prevState,
      );

      toast.success(res.data.status === 'COMPLETED' ? 'Course completed. Well done!' : 'Lesson completed');
      if (goNext && next) setSelectedId(next.id);
    } catch (err) {
      setLessonError(getErrorMessage(err));
    } finally {
      setMarking(false);
    }
  }

  if (error) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <p className="text-red-600">{error}</p>
        <p className="mt-2 text-sm text-slate-500">You need to be enrolled in this course as a student.</p>
        <Link href={`/courses/${courseId}`} className="mt-4 inline-block text-blue-600 hover:underline">
          Go to the course page
        </Link>
      </div>
    );
  }

  if (!course || !progress) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-2 w-64" />
        <div className="grid gap-6 pt-4 lg:grid-cols-[18rem_1fr]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const isDone = lesson ? progress.completedLessonIds.includes(lesson.id) : false;
  const video = lesson ? safeHref(lesson.videoUrl) : undefined;

  const list = (
    <ol className="space-y-1">
      {lessons.map((l) => {
        const done = progress.completedLessonIds.includes(l.id);
        const active = l.id === selectedId;
        return (
          <li key={l.id}>
            <button
              onClick={() => {
                setSelectedId(l.id);
                setListOpen(false);
              }}
              aria-current={active ? 'true' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                active ? 'bg-blue-50 font-medium text-blue-700' : 'hover:bg-slate-50'
              }`}
            >
              {done ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
              ) : (
                <Circle size={18} className="shrink-0 text-slate-300" />
              )}
              <span className="min-w-0 flex-1 truncate" title={l.title}>
                {l.position}. {l.title}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div>
      <LearnHeader courseId={courseId} title={course.title} progress={progress} active="lessons" />

      {progress.status === 'COMPLETED' && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <Trophy size={20} className="shrink-0" />
          <span>
            You completed this course.{' '}
            <Link href={`/courses/${courseId}#reviews`} className="font-semibold underline">
              Leave a review
            </Link>
          </span>
        </div>
      )}

      {lessons.length === 0 ? (
        <p className={`${cardClass} p-8 text-center text-slate-500`}>This course has no lessons yet.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          {/* Lesson list: collapsible on mobile, sticky sidebar on desktop */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <button
              onClick={() => setListOpen(!listOpen)}
              aria-expanded={listOpen}
              className={`${cardClass} flex w-full items-center justify-between px-4 py-3 lg:hidden`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ListChecks size={18} /> Lessons ({progress.completedLessons}/{progress.totalLessons})
              </span>
              <ChevronDown size={18} className={`transition ${listOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`${cardClass} p-3 ${listOpen ? 'mt-2 block' : 'hidden'} lg:mt-0 lg:block`}>{list}</div>
          </aside>

          <section className={`${cardClass} p-6 sm:p-8`}>
            {!lesson || loadingLesson ? (
              lessonError ? <p className="text-red-600">{lessonError}</p> : <LessonSkeleton />
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Lesson {lesson.position} of {lessons.length}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{lesson.title}</h2>
                <div className="mt-5 whitespace-pre-line leading-relaxed text-slate-700">{lesson.content}</div>

                {(video || lesson.fileUrl) && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {video && (
                      <a href={video} target="_blank" rel="noreferrer" className={secondaryBtn}>
                        <Video size={16} /> Watch video
                      </a>
                    )}
                    {lesson.fileUrl && (
                      <DownloadButton path={lesson.fileUrl} label="Download material" className={secondaryBtn} />
                    )}
                  </div>
                )}

                {lessonError && (
                  <p role="alert" className="mt-4 text-sm text-red-600">
                    {lessonError}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  <button onClick={() => prev && setSelectedId(prev.id)} disabled={!prev} className={secondaryBtn}>
                    <ArrowLeft size={16} /> Previous
                  </button>

                  {isDone ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircle2 size={18} /> Completed
                    </span>
                  ) : (
                    <button onClick={() => markComplete(!!next)} disabled={marking} className={primaryBtn}>
                      {marking ? 'Saving...' : next ? 'Complete and continue' : 'Mark as complete'}
                    </button>
                  )}

                  <button onClick={() => next && setSelectedId(next.id)} disabled={!next} className={secondaryBtn}>
                    Next <ArrowRight size={16} />
                  </button>
                </div>

                <p className="mt-4 hidden text-center text-xs text-slate-400 sm:block">
                  Tip: use the left and right arrow keys to switch lessons
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
import Link from 'next/link';
import { BarChart3, BookOpen, ClipboardCheck, ShieldCheck } from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import { apiFetch } from '@/lib/server-api';
import type { Category, Course, Paginated } from '@/lib/types';

const features = [
  {
    icon: BookOpen,
    title: 'Structured courses',
    text: 'Instructors publish courses made of ordered lessons, with files and video links.',
  },
  {
    icon: BarChart3,
    title: 'Progress tracking',
    text: 'Complete lessons and watch your progress percentage grow automatically.',
  },
  {
    icon: ClipboardCheck,
    title: 'Assignments and grading',
    text: 'Submit work before the deadline and get marks with written feedback.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    text: 'Admins, instructors and students each get tools built for their role.',
  },
];

export default async function HomePage() {
  const [categories, latest] = await Promise.all([
    apiFetch<Category[]>('/categories').catch(() => [] as Category[]),
    apiFetch<Paginated<Course>>('/courses?limit=3&sort=newest').catch(() => null),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Learn, teach and manage courses in one place
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
            EduFlow brings lessons, assignments, grading and progress tracking together, so students
            and instructors can focus on learning.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow transition hover:bg-blue-50"
            >
              Browse courses
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-white/50 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl">Everything you need to learn and teach</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6">
          <h2 className="text-xl font-bold">Explore by category</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/courses?categoryId=${c.id}`}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-600 hover:text-blue-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest courses */}
      {latest && latest.items.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-bold">Latest courses</h2>
            <Link href="/courses" className="text-sm font-medium text-blue-600 hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.items.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="rounded-3xl bg-slate-900 px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold md:text-3xl">Ready to start?</h2>
          <p className="mt-2 text-slate-300">Join as a student or start teaching your own course.</p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            Create your account
          </Link>
        </div>
      </section>
    </main>
  );
}
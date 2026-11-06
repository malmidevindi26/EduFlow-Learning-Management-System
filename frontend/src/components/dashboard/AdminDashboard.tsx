'use client';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';
import StatCard, { STAT_TONES } from '@/components/ui/StatCard';
import { BookOpen, ClipboardList, GraduationCap, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { AdminStats } from '@/lib/types';

function Bars({ data }: { data?: Record<string, number> }) {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No data yet.</p>;
  }
  const max = Math.max(1, ...entries.map(([, value]) => value));

  return (
    <ul className="space-y-3">
      {entries.map(([key, value]) => (
        <li key={key}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{key.charAt(0) + key.slice(1).toLowerCase()}</span>
            <span className="font-medium">{value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${(value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<AdminStats>('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  if (!stats) return <DashboardSkeleton />
  const cards = [
    { label: 'Users', value: stats.totalUsers, icon: Users },
    { label: 'Courses', value: stats.totalCourses, icon: BookOpen },
    { label: 'Enrollments', value: stats.totalEnrollments, icon: GraduationCap },
    { label: 'Submissions', value: stats.totalSubmissions, icon: ClipboardList },
    { label: 'Reviews', value: stats.totalReviews, icon: Star },
  ];
  const pending = stats.coursesByStatus.PENDING ?? 0;

  const links = [
    { href: '/admin/courses', title: 'Course approvals', text: `${pending} waiting for review` },
    { href: '/admin/users', title: 'Manage users', text: 'Roles and account status' },
    { href: '/admin/categories', title: 'Categories', text: 'Create, rename, delete' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value, icon }, i) => (
          <StatCard key={label} label={label} value={value} icon={icon} tone={STAT_TONES[i % STAT_TONES.length]} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold">{l.title}</p>
            <p className="mt-1 text-sm text-slate-500">{l.text}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Users by role</h2>
          <Bars data={stats.usersByRole} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Courses by status</h2>
          <Bars data={stats.coursesByStatus} />
        </section>
      </div>
    </div>
  );
}
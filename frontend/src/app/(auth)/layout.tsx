import { BookOpen, ClipboardCheck, GraduationCap, LineChart } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

const points = [
    { icon: BookOpen, text: 'Structured courses with lessons, files and video links' },
    { icon: LineChart, text: 'Automatic progress tracking for every student' },
    { icon: ClipboardCheck, text: 'Assignments, deadlines and written feedback' },
]

function Logo({ light = false }: { light?: boolean }){
    return (
      <Link href="/" className={`flex items-center gap-2 text-xl font-bold ${light ? 'text-white' : 'text-slate-900'}`}>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${light ? 'bg-white/20' : 'bg-blue-600 text-white'}`}>
          <GraduationCap size={20} />
        </span>
        EduFlow
      </Link>
    );
}

export default function AuthLayout({ children }: { children: ReactNode }){
    return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-blue-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative">
          <h2 className="max-w-md text-4xl font-bold leading-tight">Learn, teach and grow in one place.</h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-blue-100">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-blue-200">&copy; {new Date().getFullYear()} EduFlow LMS</p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
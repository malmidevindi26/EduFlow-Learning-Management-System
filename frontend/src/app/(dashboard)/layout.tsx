'use client'

import { GraduationCap, Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import Sidebar from '@/components/shell/Sidebar';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }){
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if(!loading && !user) router.replace('/login')
    }, [loading, user, router])

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
        window.addEventListener('keydown', onKey)
    }, [])

    if(loading || !user){
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size={28} className="text-blue-600" />
        </div>
      ); 
    }

    return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-slate-100">
          <Menu size={22} />
        </button>
        <span className="flex items-center gap-2 font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GraduationCap size={16} />
          </span>
          EduFlow
        </span>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-in bg-white shadow-xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl animate-fade-in px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
'use client';

import { GraduationCap, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { findActive, NAV } from './nav';

const ROLE_LABEL = { ADMIN: 'Administrator', INSTRUCTOR: 'Instructor', STUDENT: 'Student' } as const

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }){
    const { user, logout } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    if(!user) return null

    const items = NAV[user.role]
    const active = findActive(items, pathname)

    function handleLogout(){
        logout()
        toast.success('You have been logged out')
        router.push('/login')
    }

    return (
    <div className="flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2 px-6 py-5 text-lg font-bold">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
          <GraduationCap size={20} />
        </span>
        EduFlow
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active === href ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active === href ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
} 
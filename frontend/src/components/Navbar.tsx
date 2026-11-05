'use client'

import { GraduationCap, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function NavBar(){
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [ open, setOpen ] = useState(false)

    function handleLogout(){
        logout()
        setOpen(false)
        router.push('/')
    }

    const linkClass = 'text-sm font-medium text-slate-600 transition hover:text-blue-600';

    return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap size={18} />
            </span>
            EduFlow
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/courses" className={linkClass}>
              Courses
            </Link>
            {user && (
              <Link href="/dashboard" className={linkClass}>
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass}>
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-6 py-3 md:hidden">
          <Link href="/courses" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium">
            Courses
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium">
                Dashboard
              </Link>
              <p className="py-2 text-xs text-slate-500">
                {user.name} ({user.role})
              </p>
              <button onClick={handleLogout} className="py-2 text-sm font-medium text-red-600">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium">
                Log in
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-blue-600">
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
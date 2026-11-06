'use client'

import { GraduationCap, LayoutDashboard, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function NavBar(){
    const { user, loading } = useAuth()
    const router = useRouter()
    const [ open, setOpen ] = useState(false)
    const pathname = usePathname()

    const linkClass = (href: string) =>
    `text-sm font-medium transition ${
      pathname === href || pathname.startsWith(`${href}/`) ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
    }`;

    return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap size={18} />
            </span>
            EduFlow
          </Link>
          <Link href="/courses" className={`hidden md:block ${linkClass('/courses')}`}>
            Courses
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={linkClass('/login')}>
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-6 py-3 md:hidden">
          <Link href="/courses" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium">
            Courses
          </Link>
          {user ? (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-blue-600">
              Dashboard
            </Link>
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
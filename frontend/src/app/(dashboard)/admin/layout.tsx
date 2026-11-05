'use client'

import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"

const tabs = [
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/courses', label: 'Courses' },
]

export default function AdminLayout({ children }: { children: ReactNode }){
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if(user && user.role !== 'ADMIN') router.replace('/dashboard')
    }, [user, router])

    if(!user || user.role !== 'ADMIN') return null

    return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">
        <ChevronLeft size={16} /> Dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Administration</h1>

      <div className="mb-6 mt-4 flex overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
              pathname.startsWith(t.href)
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
'use client'

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }){
    const { user, loading, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if(!loading && !user) router.replace('/login')
    }, [loading, user, router])

    if(loading || !user){
        return <p className="p-8 text-gray-500">Loading...</p>
    }

    return (
    <div>
      <header className="flex items-center justify-between bg-white px-6 py-3 shadow">
        <span className="text-lg font-bold">EduFlow</span>
        <div className="flex items-center gap-4 text-sm">
          <span>
            {user.name} <span className="text-gray-500">({user.role})</span>
          </span>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
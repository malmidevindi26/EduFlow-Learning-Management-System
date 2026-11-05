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
        return <p className="p-8 text-slate-500">Loading...</p>;
    }

    return <main className='mx-auto max-w-6xl px-6 py-8'>{children}</main>
}
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function InstructorLayout({ children }: { children: ReactNode }){
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if(user && user.role !== 'INSTRUCTOR') router.replace('/dashboard')
    }, [user, router])

    if(!user || user.role !== 'INSTRUCTOR') return null
    return <>{children}</>
}
'use client'

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import type { EnrollmentItem } from '@/lib/types'

export function useEnrollment(courseId: string){
    const { user, loading: authLoading } = useAuth()
    const [enrollment, setEnrollment] = useState<EnrollmentItem | null>(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if(!user || user.role !== 'STUDENT'){
            setEnrollment(null)
            setLoading(false)
            return
        }
        try {
            const res = await api.get<EnrollmentItem[]>('/enrollments/my')
            setEnrollment(res.data.find((e) => e.course.id === courseId) ?? null)
        } catch (error) {
            setEnrollment(null)
        }finally{
            setLoading(false)
        }
    }, [user, courseId])

    useEffect(() => {
        if(!authLoading) refresh()
    }, [authLoading, refresh])

    return { enrollment, loading: authLoading || loading, refresh }
}
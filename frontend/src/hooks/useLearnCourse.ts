'use client'

import { useEffect, useState } from "react"
import { api, getErrorMessage } from "@/lib/api"
import type { CourseDetails, CourseProgress  } from '@/lib/types'

export function useLearnCourse(courseId: string){
    const [course, setCourse] = useState<CourseDetails | null>(null)
    const [progress, setProgress] = useState<CourseProgress | null>(null)
    const[error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        Promise.all([
            api.get<CourseDetails>(`/courses/${courseId}`),
            api.get<CourseProgress>(`/courses/${courseId}/progress`)
        ])
            .then(([c, p]) => {
                if(cancelled) return
                setCourse(c.data)
                setProgress(p.data)
            })
            .catch((err) => {
                if(!cancelled) setError(getErrorMessage(err))
            })
        return () => {
            cancelled = true
        }
    }, [courseId])
    
    return { course, progress, setProgress, error }
}
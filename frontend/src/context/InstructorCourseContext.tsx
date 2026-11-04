'use client'

import { createContext, useContext } from "react"
import type { ManagedCourse } from "@/lib/types"

interface Value {
    course: ManagedCourse
    reload: () => Promise<void>
}

export const InstructorCourseContext = createContext<Value | null>(null)

export function useManagedCourse() {
    const value = useContext(InstructorCourseContext)
    if(!value) throw new Error('useManagedCourse must be used inside the course layout')
    return value
}
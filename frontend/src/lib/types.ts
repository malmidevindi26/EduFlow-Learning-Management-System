export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'

export interface User {
    id: string
    email: string
    name: string
    role: Role
}

export interface AuthResponse {
    accessToken: string
    user: User
}

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export const LEVELS: { value: CourseLevel; label: string }[] = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
]

export interface Category {
    id: string
    name: string
    description: string | null
}

export interface Course {
    id: string
    title: string
    description: string
    level: CourseLevel
    thumbnailUrl: string | null
    status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED'
    createdAt: string
    category: { id: string; name: string }
    instructor: { id: string; name: string }

}

export interface LessonSummary{
    id: string
    title: string
    position: number
}

export interface CourseDetails extends Course{
    lessons: LessonSummary[]
}

export interface Paginated<T> {
    items: T[]
    meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface Review {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: { id: string; name: string }
}

export interface ReviewsResponse {
    average: number | null
    count: number
    items: Review[]
}
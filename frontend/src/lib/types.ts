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

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED'

export interface EnrollmentItem {
    id: string
    status: EnrollmentStatus
    enrolledAt: string
    course: {
        id: string
        title: string
        thumbnailUrl: string | null
        level: CourseLevel
        category: { id: string; name: string }
        instructor: { id: string; name: string }
    };
    completedLessons: number
    totalLessons: number
    progress: number
}

export interface CourseProgress{
    status: EnrollmentStatus
    completedLessonIds: string[]
    completedLessons: number
    totalLessons: number
    progress: number 
}

export interface LessonContent{
    id: string
    title: string
    content: string
    videoUrl: string | null
    fileUrl: string | null
    position: number
    courseId: string
    completed: boolean
}

export interface Assignment{
    id: string
    title: string
    description:  string
    dueDate: string
    maxMarks: number
    courseId: string
}

export interface Submission {
    id: string
    assignmentId: string
    answerText: string | null
    fileUrl: string | null
    submittedAt: string
    isLate: boolean
    marks: number | null
    feedback: string | null
    status: 'SUBMITTED' | 'GRADED'
    gradeAt: string | null
}

export interface MySubmission extends Submission{
    assignment: {
        id: string
        title: string
        dueDate: string
        maxMarks: number
        course: { id: string; title: string }
    }
}

export type CourseStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED'

export interface MyCourse extends Course{
    _count: { lessons: number }
}

export interface ManagedCourse extends CourseDetails{
    categoryId: string
    instructorId: string
}

export interface LessonFull{
    id: string
    title: string
    content: string
    videoUrl: string | null
    fileUrl: string | null
    position: number
    courseId: string
}

export interface CourseStudent{
    enrollmentId: string
    student: { id: string; name: string; email: string }
    status: EnrollmentStatus
    enrolledAt: string
    completedLessons: number
    totalLessons: number
    progress: number
}

export interface SubmissionWithStudent extends Submission{
    student: { id: string; name: string; email: string }
}

export interface InstructorStats {
    totalCourses: number
    totalStudents: number
    pendingGrading: number
    averageRating: number | null
    totalReviews: number
}

export interface AdminUser {
    id: string
    email: string
    name: string
    role: Role
    isActive: boolean
    createdAt: string
}

export interface AdminStats{
    totalUsers: number
    totalCourses: number
    totalEnrollments: number
    totalSubmissions: number
    totalReviews: number
    usersByRole: Record<Role, number>
    coursesByStatus: Record<CourseStatus, number>
}
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
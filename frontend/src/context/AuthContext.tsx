'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { api, TOKEN_KEY } from '@/lib/api'
import type { AuthResponse, User } from "@/lib/types"

interface RegisterInput {
    name: string
    email: string
    password: string
    role: 'STUDENT' | 'INSTRUCTOR'
}

interface AuthContextValue{
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<User>
    register: (input: RegisterInput) => Promise<User>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }){
    const [ user, setUser ] = useState<User | null>(null)
    const [ loading, setLoading ] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY)
        if(!token) {
            setLoading(false)
            return
        }
        api
          .get<User>('/auth/me')
          .then((res) => setUser(res.data))
          .catch(() => localStorage.removeItem(TOKEN_KEY))
          .finally(() => setLoading(false))
    }, [])

    const saveSession = useCallback((data: AuthResponse) => {
        localStorage.setItem(TOKEN_KEY, data.accessToken)
        setUser(data.user)
        return data.user
    }, [])

    const login = useCallback(
        async (email: string, password: string) => {
            const res = await api.post<AuthResponse>('/auth/login', {
                email,
                password
            })
            return saveSession(res.data)
        },
        [saveSession],
    )

    const register = useCallback(
        async (input: RegisterInput) => {
            const res = await api.post<AuthResponse>('/auth/register', input)
            return saveSession(res.data)
        },
        [saveSession]
    )

   const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
   }, [])

   return(
    <AuthContext.Provider value={{ user, loading, login, register,logout }}>
        {children}
    </AuthContext.Provider>
   )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if(!context) throw new Error('useAuth must be used inside AuthProvider')
    return context
}
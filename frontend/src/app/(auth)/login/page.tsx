'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getErrorMessage } from "@/lib/api"

export default function LoginPage() {
    const { login } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [submitting,setSubmitting] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await login(email, password)
            router.push('/dashboard')
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setSubmitting(false)
        }
        
    }

    return (
    <main className="mx-auto flex min-h-[70vh] py-10 max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-bold">Log in to EduFlow</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        No account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </main>
  );
}
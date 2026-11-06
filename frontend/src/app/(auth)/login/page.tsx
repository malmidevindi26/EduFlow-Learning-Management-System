'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import PasswordInput from '@/components/ui/PasswordInput';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { inputClass, labelClass, primaryBtn } from '@/lib/ui';

export default function LoginPage() {
    const { login , user, loading} = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [submitting,setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // skip the form , if already logged
    useEffect(() => {
      if(!loading && user) router.replace('/dashboard')
    }, [loading, user, router])

    // redirect here because the token expired
    useEffect(() => {
      if(new URLSearchParams(window.location.search).get('expired')){
        toast.info('Your session expired. Please log in again')
      }
    }, [])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const loggedIn =  await login(email, password)
            toast.success(`Welcome back, ${loggedIn.name}`)
            router.push('/dashboard')
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setSubmitting(false)
        }
        
    }

    return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-slate-600">Log in to continue learning or teaching.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            maxLength={120}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} mt-1.5`}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <div className="mt-1.5">
            <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
          </div>
        </div>

        <button type="submit" disabled={submitting} className={`${primaryBtn} w-full py-3`}>
          {submitting && <Spinner />} {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New to EduFlow?{' '}
        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
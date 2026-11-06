'use client'

import { GraduationCap, Presentation } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import PasswordInput from '@/components/ui/PasswordInput';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { inputClass, labelClass, primaryBtn } from '@/lib/ui';

type SignupRole = 'STUDENT' | 'INSTRUCTOR'

const ROLES = [
  { value: 'STUDENT', title: 'Student', text: 'Learn from courses', icon: GraduationCap },
  { value: 'INSTRUCTOR', title: 'Instructor', text: 'Teach and grade', icon: Presentation },
] as const

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'];

function strength(p: string){
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
}

export default function RegisterPage(){
    const { register, user, loading } = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<SignupRole>('STUDENT')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
      if (!loading && user) router.replace('/dashboard')
    }, [loading, user, router])

    const score = password ? strength(password) : 0

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const created = await register({ name: name.trim(), email, password, role })
            toast.success(`Account created. Welcome, ${created.name}`)
            router.push('/dashboard')
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setSubmitting(false)
        }
    }

    return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-slate-600">Start learning or teaching in a minute.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <p className={labelClass}>I want to</p>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            {ROLES.map(({ value, title, text, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={role === value}
                onClick={() => setRole(value)}
                className={`rounded-xl border p-4 text-left transition ${
                  role === value
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100'
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
              >
                <Icon size={22} className={role === value ? 'text-blue-600' : 'text-slate-400'} />
                <p className="mt-2 text-sm font-semibold">{title}</p>
                <p className="text-xs text-slate-500">{text}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="name" className={labelClass}>
            Full name
          </label>
          <input
            id="name"
            required
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} mt-1.5`}
          />
        </div>

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
            <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? STRENGTH_COLOR[score] : 'bg-slate-200'}`} />
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">{STRENGTH_LABEL[score]} (at least 8 characters)</p>
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className={`${primaryBtn} w-full py-3`}>
          {submitting && <Spinner />} {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
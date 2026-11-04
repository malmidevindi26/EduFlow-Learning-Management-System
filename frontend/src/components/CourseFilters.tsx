'use client'

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { LEVELS, type Category } from "@/lib/types"
import { stripMarkupChars } from '@/lib/sanitize';

interface Values{
    search: string
    categoryId: string
    level: string
    sort: string 
}

export default function CourseFilters({
    categories,
    initial,
}: {
    categories: Category[]
    initial: Values
}){
    const router = useRouter()
    const [values, setValues] = useState<Values>(initial)

    function apply(next: Values){
        const param = new URLSearchParams()
        // if(next.search.trim()) param.set('search', next.search.trim())
        const search = stripMarkupChars(next.search).trim().slice(0, 100)
        if (search) param.set('search', search)
        if(next.categoryId) param.set('categoryId', next.categoryId)
        if(next.level) param.set('level', next.level)
        if(next.sort && next.sort !== 'newest') param.set('sort', next.sort)
        const qs = param.toString()
        router.push(qs ? `/courses?${qs}` : '/courses' )
    }

    function change(key: keyof Values, value: string){
        const next = { ...values, [key]: value}
        setValues(next)
        apply(values)
    }

    function handleSearch(e: FormEvent){
        e.preventDefault()
        apply(values)
    }

    const fieldClass = 'rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

    return (
    <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row">
      <form onSubmit={handleSearch} className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={values.search}
            onChange={(e) => setValues({ ...values, search: e.target.value })}
            placeholder="Search courses..."
            maxLength={100}
            className={`${fieldClass} w-full pl-9`}
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      <select
        value={values.categoryId}
        onChange={(e) => change('categoryId', e.target.value)}
        className={fieldClass}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={values.level}
        onChange={(e) => change('level', e.target.value)}
        className={fieldClass}
      >
        <option value="">All levels</option>
        {LEVELS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      <select
        value={values.sort}
        onChange={(e) => change('sort', e.target.value)}
        className={fieldClass}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="title">Title (A-Z)</option>
      </select>
    </div>
  );
}
'use client'

import { inputClass } from "@/lib/ui"
import { Search, X } from "lucide-react"
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

const DEFAULTS: Values = { search: '', categoryId: '', level: '', sort: 'newest' }

export default function CourseFilters({
    categories,
    initial,
}: {
    categories: Category[]
    initial: Values
}){
    const router = useRouter()
    const [values, setValues] = useState<Values>(initial)

    const hasFilters = values.search !== '' || values.categoryId !== '' || values.sort !== 'newest'

    function apply(next: Values){
        const params = new URLSearchParams();
        const search = stripMarkupChars(next.search).trim().slice(0, 100)
        if (search) params.set('search', search)
        if (next.categoryId) params.set('categoryId', next.categoryId)
        if (next.level) params.set('level', next.level)
        if (next.sort && next.sort !== 'newest') params.set('sort', next.sort)
        const qs = params.toString()
        router.push(qs ? `/courses?${qs}` : '/courses')
    }

    function change(key: keyof Values, value: string){
        const next = { ...values, [key]: value}
        setValues(next)
        apply(next)
    }

    function handleSearch(e: FormEvent){
        e.preventDefault()
        apply(values)
    }

    function clear(){
      setValues(DEFAULTS)
      router.push('/courses')
    }

    return (
       <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={values.search}
              onChange={(e) => setValues({ ...values, search: e.target.value })}
              maxLength={100}
              placeholder="Search courses..."
              aria-label="Search courses"
              className={`${inputClass} pl-10`}
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <select
          value={values.categoryId}
          onChange={(e) => change('categoryId', e.target.value)}
          aria-label="Category"
          className={`${inputClass} lg:w-48`}
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
          aria-label="Level"
          className={`${inputClass} lg:w-40`}
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
          aria-label="Sort by"
          className={`${inputClass} lg:w-40`}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clear}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          <X size={14} /> Clear all filters
        </button>
      )}
    </div>
    );
}
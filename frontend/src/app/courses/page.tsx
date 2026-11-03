import CourseCard from "@/components/CourseCard";
import CourseFilters from '@/components/CourseFilters';
import Pagination from '@/components/Pagination';
import { apiFetch } from '@/lib/server-api';
import type { Category, Course, Paginated } from '@/lib/types';

type SearchParams = Promise<{
    search? : string
    categoryId?: string
    level?: string
    sort?: string
    page?: string
}>

const LEVEL_VALUES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const SORT_VALUES = ['newest', 'oldest', 'title']

export default async function CoursesPage({
    searchParams,
} : {
    searchParams: SearchParams
}){
    const sp = await searchParams

     const search = sp.search?.trim() ?? '';
     const categoryId = sp.categoryId ?? '';
     const level = LEVEL_VALUES.includes(sp.level ?? '') ? sp.level! : '';
     const sort = SORT_VALUES.includes(sp.sort ?? '') ? sp.sort! : 'newest';
     const page = Math.max(1, Number(sp.page) || 1);

     const query = new URLSearchParams({ page: String(page), limit: '9', sort })
     if(search) query.set('search', search)
     if(categoryId) query.set('categoryId', categoryId)
     if(level) query.set('level', level)

    const [categories, result] = await Promise.all([
        apiFetch<Category[]>('/categories'),
        apiFetch<Paginated<Course>>(`/courses?${query.toString()}`)
    ])

    const keep: Record<string, string> = {}
    if(search) keep.search = search
    if(categoryId) keep.categoryId = categoryId
    if(level) keep.level = level
    if(sort !== 'newest') keep.sort = sort

    return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse courses</h1>
        <p className="mt-1 text-slate-600">
          {result.meta.total} course{result.meta.total === 1 ? '' : 's'} available
        </p>
      </div>

      <CourseFilters
        categories={categories}
        initial={{ search, categoryId, level, sort }}
      />

      {result.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-medium">No courses found</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search or clear the filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <Pagination page={result.meta.page} totalPages={result.meta.totalPages} params={keep} />
    </div>
  );
}
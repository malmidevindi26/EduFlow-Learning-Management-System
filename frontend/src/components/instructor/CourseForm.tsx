'use client'

import { useEffect, useState, type FormEvent } from "react"
import { api, getErrorMessage } from '@/lib/api'
import { LEVELS, type Category, type CourseLevel, type ManagedCourse } from "@/lib/types"
import { inputClass, labelClass, primaryBtn } from "@/lib/ui"
import { toast } from 'sonner';

export default function CourseForm({
    initial,
    onSaved,
}: {
    initial?: ManagedCourse
    onSaved: (id: string) => void | Promise<void>
}) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [level, setLevel] = useState<CourseLevel>(initial?.level ?? 'BEGINNER');
    const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
    const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? '');
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api
          .get<Category[]>('/categories')
          .then((res) => setCategories(res.data))
          .catch(() => setError('Could not load categories'))
    }, [])

    async function handleSubmit(e: FormEvent){
        e.preventDefault()
        setError('')
        setSaved(false)
        if(!categoryId){
            setError('Please choose a category')
            return
        }
        setBusy(true)
        try{
            const body = {
                title: title.trim(),
                description: description.trim(),
                level,
                categoryId,
                thumbnailUrl: thumbnailUrl.trim() || null,
            }
            const res = initial
                ? await api.patch<{ id: string }>(`/courses/${initial.id}`, body)
                : await api.post<{ id: string }>('/courses', body)
            setSaved(true)
            toast.success(initial ? 'Course saved' : 'Course created')
            await onSaved(res.data.id)    
        }catch (err){
            setError(getErrorMessage(err))
        }finally{
            setBusy(false)
        }
    }

    return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && !error && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Saved</p>
      )}

      <label className={labelClass}>
        Title
        <input
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </label>

      <label className={labelClass}>
        Description
        <textarea
          required
          rows={5}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Category
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`${inputClass} mt-1`}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Level
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel)}
            className={`${inputClass} mt-1`}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        Thumbnail URL (optional, http/https)
        <input
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://..."
          className={`${inputClass} mt-1`}
        />
      </label>

      <button type="submit" disabled={busy} className={primaryBtn}>
        {busy ? 'Saving...' : initial ? 'Save changes' : 'Create course'}
      </button>
    </form>
  );

}
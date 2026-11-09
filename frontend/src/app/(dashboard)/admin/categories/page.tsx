'use client';

import { Check, Pencil, Plus, Trash2, X, FolderTree  } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { Category } from '@/lib/types';
import { inputClass, labelClass, primaryBtn } from '@/lib/ui';
import CharCount from '@/components/ui/CharCount';
import Tooltip from '@/components/ui/Tooltip'
import { useConfirm } from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';


export default function AdminCategoriesPage(){
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const confirm = useConfirm()

    const load = useCallback(async () => {
        try {
            const res = await api.get<Category[]>('/categories')
                setCategories(res.data)
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    async function run(action: () => Promise<unknown>){
        setBusy(true)
        setError('')
        try {
            await action()
            await load()
            return true
        } catch (error) {
            setError(getErrorMessage(error))
            return false
        }finally{
            setBusy(false)
        }
    }

    async function handleCreate(e: FormEvent){
        e.preventDefault()
        const ok = await run(() => 
          api.post('/categories', {
            name: name.trim(),
            description: description.trim() || undefined,
          })       
        )
        if(ok){
            setName('')
            setDescription('')
        }
    }

    function startEdit(c: Category){
        setEditId(c.id)
        setEditName(c.name)
        setEditDescription(c.description ?? '')
    }

    async function saveEdit(id: string){
        const ok = await run(() => 
           api.patch(`/categories/${id}`, {
            name: editName.trim(),
            description: editDescription.trim() || null
           }),  
        )
        if(ok) setEditId(null)
    }

    async function remove(c: Category){
        const ok = await confirm({
          title: `Delete “${c.name}”?`,
          message: 'This canot be undone',
          confirmLabel: 'Delete',
          danger: true
        })
        if(!ok) return
        run(() => api.delete(`/categories/${c.id}`))
    }

    return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">New category</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
          <label className={labelClass}>
            Name
            <input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} mt-1`} />
            <CharCount value={name} max={60} />
          </label>
          <label className={labelClass}>
            Description (optional)
            <input maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} mt-1`} />
            <CharCount value={description} max={300} />
          </label>
          <button type="submit" disabled={busy} className={`${primaryBtn} flex items-center justify-center gap-1`}>
            <Plus size={16} /> Add
          </button>
        </div>
      </form>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {!categories ? (
        <p className="text-slate-500">Loading categories...</p>
      ) : categories.length === 0 ? (
         <EmptyState
           icon={FolderTree}
           title="No categories yet"
           text="Add one using the form above."
        />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              {editId === c.id ? (
                <>
                  <input maxLength={60} value={editName} onChange={(e) => setEditName(e.target.value)} className={`${inputClass} md:w-56`} />
                  <input
                    maxLength={300}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    className={`${inputClass} flex-1`}
                  />
                  <button onClick={() => saveEdit(c.id)} disabled={busy} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" aria-label="Save">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditId(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cancel">
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p title={c.name} className="truncate font-medium">{c.name}</p>
                    {c.description && (
                      <p title={c.description} className="line-clamp-2 text-sm text-slate-500">{c.description}</p>
                    )}
                  </div>
                  <Tooltip text="Rename">
                    <button onClick={() => startEdit(c)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Rename category">
                      <Pencil size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Delete">
                    <button onClick={() => remove(c)} disabled={busy} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600" aria-label="Delete category">
                      <Trash2 size={16} />
                    </button>
                  </Tooltip>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

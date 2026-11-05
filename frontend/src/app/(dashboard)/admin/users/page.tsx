'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import { stripMarkupChars } from '@/lib/sanitize';
import type { AdminUser, Paginated, Role } from '@/lib/types';
import { inputClass, primaryBtn, secondaryBtn } from '@/lib/ui';

const ROLES: Role[] = ['ADMIN', 'INSTRUCTOR', 'STUDENT']

export default function AdminUsersPage(){
    const { user: me } = useAuth()
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [role, setRole] = useState('')
    const [page, setPage] = useState(1)
    const [data, setData] = useState<Paginated<AdminUser> | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [error, setError] = useState('')

    const load = useCallback(async () => {
        try {
            const params: Record<string, string | number> = { page, limit: 10 }
            if(search) params.search = search
            if(role) params.role = role
            const res = await api.get<Paginated<AdminUser>>('/users', { params })
            setData(res.data)
            setError('')
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }, [page, search, role])

    useEffect(() => {
        load()
    }, [load])

    function handleSearch(e: FormEvent){
        e.preventDefault()
        setPage(1)
        setSearch(stripMarkupChars(searchInput).trim().slice(0, 100))
    }

    async function update(target: AdminUser, body: { role?: Role; isActive?: boolean }, message: string){
        if(!window.confirm(message)) return
        setBusyId(target.id)
        setError('')
        try {
            await api.patch(`/users/${target.id}`, body)
            await load()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusyId(null)
        }
    }

    return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={100}
              placeholder="Search by name or email..."
              className={`${inputClass} pl-9`}
            />
          </div>
          <button type="submit" className={primaryBtn}>
            Search
          </button>
        </form>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className={`${inputClass} md:w-44`}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {!data ? (
        <p className="text-slate-500">Loading users...</p>
      ) : data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((u) => {
                const isMe = u.id === me?.id;
                const busy = busyId === u.id;
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {u.name} {isMe && <span className="text-xs text-slate-400">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isMe || busy}
                        onChange={(e) => {
                          const next = e.target.value as Role;
                          e.target.value = u.role; // snap back until the change is confirmed
                          update(u, { role: next }, `Change ${u.name} from ${u.role} to ${next}?`);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0) + r.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={isMe || busy}
                        onClick={() =>
                          update(
                            u,
                            { isActive: !u.isActive },
                            u.isActive
                              ? `Deactivate ${u.name}? They will not be able to log in.`
                              : `Activate ${u.name}?`,
                          )
                        }
                        className={`${secondaryBtn} ${u.isActive ? 'text-red-600' : ''}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${secondaryBtn} flex items-center gap-1`}>
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} users)
          </span>
          <button
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage(page + 1)}
            className={`${secondaryBtn} flex items-center gap-1`}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
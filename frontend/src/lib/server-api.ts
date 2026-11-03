const BASE = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
    constructor(public status: number, message: string,){ super(message) }
}

export async function apiFetch<T>(path: string): Promise<T>{
    const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
    if(!res.ok) throw new ApiError(res.status, `Request failed (${res.status})`)
    return res.json() as Promise<T>
}
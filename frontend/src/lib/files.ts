import { api } from "./api";

const ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\/?$/, '')

export function fileHref(path: string){
    return path.startsWith('http') ? path : `${ORIGIN}${path}`
}

export async function uploadFile(file: File){
    const form = new FormData()
    form.append('file', file)
    const res = await api.post<{ url: string; originalName: string; size: number }>(
        '/uploads',
        form,
    )
    return res.data
}
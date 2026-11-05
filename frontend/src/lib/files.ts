import { api } from "./api";
import { InputValidationError, isUploadPath, isWebUrl } from "./sanitize";

const ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\/?$/, '')

const ALLOWED_EXT = [
  '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.zip', '.txt',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
]
const MAX_SIZE = 10 * 1024 * 1024

export function fileHref(path: string){
    // return path.startsWith('http') ? path : `${ORIGIN}${path}`
    if(isUploadPath(path)) return `${ORIGIN}${path}`
    if(isWebUrl(path)) return path
    return '#'
}

export function validateFile(file: File){
    const dot = file.name.lastIndexOf('.')
    const ext = dot >=0 ? file.name.slice(dot).toLowerCase() : ''
    if(!ALLOWED_EXT.includes(ext)){
        throw new InputValidationError(`File type ${ext || '(none)'} is not allowed`)
    }
    if (file.size > MAX_SIZE){
        throw new InputValidationError('File is too large (max 10 MB)')
    }
}

export async function uploadFile(file: File){
    validateFile(file)
    const form = new FormData()
    form.append('file', file)
    const res = await api.post<{ url: string; originalName: string; size: number }>(
        '/uploads',
        form,
    )
    return res.data
}

export async function downloadFile(path: string) {
  const res = await fetch(fileHref(path));
  if (!res.ok) throw new Error('Download failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = path.split('/').pop() ?? 'file';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
'use client';

import { FileText, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { fileHref, uploadFile } from '@/lib/files';
import type { LessonFull } from '@/lib/types';
import { inputClass, labelClass, primaryBtn, secondaryBtn } from '@/lib/ui';
import { toast } from 'sonner';

const MAX_SIZE = 10 * 1024 * 1024

export default function LessonForm({
    courseId,
    lesson,
    onDone,
    onCancel,
}: {
    courseId: string
    lesson?: LessonFull
    onDone: () => Promise<void>
    onCancel: () => void
}) {
    const [title, setTitle] = useState(lesson?.title ?? '');
    const [content, setContent] = useState(lesson?.content ?? '');
    const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? '');
    const [fileUrl, setFileUrl] = useState<string | null>(lesson?.fileUrl ?? null);
    const [uploading, setUploading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function handleFile(file: File | undefined){
        if(!file) return
        if(file.size > MAX_SIZE){
            setError('File is too large (max 10MB)')
            return
        }
        setUploading(true)
        setError('')
        try {
            const res = await uploadFile(file)
            setFileUrl(res.url)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setUploading(false)
        }
    }

    async function handleSubmit(e: FormEvent){
        e.preventDefault()
        setError('')
        setBusy(true)
        try {
            const body = {
                title: title.trim(),
                content: content.trim(),
                videoUrl: videoUrl.trim() || null,
                fileUrl,
            }
            if (lesson) await api.patch(`/lessons/${lesson.id}`, body)
            else await api.post(`/courses/${courseId}/lessons`, body)
            toast.success(lesson ? 'Lesson updated' : 'Lesson added')
            await onDone()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
      <h3 className="font-semibold">{lesson ? 'Edit lesson' : 'New lesson'}</h3>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <label className={labelClass}>
        Title
        <input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputClass} mt-1`} />
      </label>

      <label className={labelClass}>
        Content
        <textarea required rows={6} maxLength={20000} value={content} onChange={(e) => setContent(e.target.value)} className={`${inputClass} mt-1`} />
      </label>

      <label className={labelClass}>
        Video link (optional, http/https)
        <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className={`${inputClass} mt-1`} />
      </label>

      <div>
        <p className={labelClass}>Material file (optional, max 10 MB)</p>
        {fileUrl && (
          <p className="mt-1 flex items-center gap-2 text-sm">
            <FileText size={14} />
            <a href={fileHref(fileUrl)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              Current file
            </a>
            <button type="button" onClick={() => setFileUrl(null)} className="text-slate-400 hover:text-red-600" aria-label="Remove file">
              <X size={14} />
            </button>
          </p>
        )}
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="mt-2 text-sm"
        />
        {uploading && <p className="mt-1 text-xs text-slate-500">Uploading...</p>}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={busy || uploading} className={primaryBtn}>
          {busy ? 'Saving...' : 'Save lesson'}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancel
        </button>
      </div>
    </form>
  );
}
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Pagination({
    page,
    totalPages,
    params,
}: {
    page: number
    totalPages: number
    params: Record<string, string>
}) {
    if(totalPages <= 1) return null

    const href = ( target: number ) => {
        const qs = new URLSearchParams(params)
        if(target > 1) qs.set('page', String(target))
        const text = qs.toString()
        return text ? `/courses?${text}` : '/courses'
    }

    const base = 'flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-medium';
    const active = `${base} border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100`;
    const disabled = `${base} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400`;

    return (
    <div className="mt-10 flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className={active}>
          <ChevronLeft size={16} /> Previous
        </Link>
      ) : (
        <span className={disabled}>
          <ChevronLeft size={16} /> Previous
        </span>
      )}

      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={active}>
          Next <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={disabled}>
          Next <ChevronRight size={16} />
        </span>
      )}
    </div>
  );
}
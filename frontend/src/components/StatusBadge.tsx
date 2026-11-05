const styles: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-amber-50 text-amber-700',
  PUBLISHED: 'bg-emerald-50 text-emerald-700',
  ARCHIVED: 'bg-rose-50 text-rose-700',
};

export default function StatusBadge({ status }: { status: string }){
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.DRAFT}`}>
           {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    )
}
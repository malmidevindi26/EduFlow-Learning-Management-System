export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-40 animate-pulse bg-slate-200" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
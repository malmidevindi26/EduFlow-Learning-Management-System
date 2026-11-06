import type { LucideIcon } from "lucide-react";

export const STAT_TONES = ['blue', 'emerald', 'amber', 'violet'] as const
type Tone = (typeof STAT_TONES)[number]

const TONE: Record<Tone, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
}

export default function StatCard({
    label,
    value,
    icon: Icon,
    tone = 'blue'
}: {
    label: string
    value: number | string
    icon: LucideIcon
    tone?: Tone
}) {
    return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition hover:-translate-y-0.5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONE[tone]}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({
    icon: Icon,
    title,
    text,
    action,
}: {
    icon: LucideIcon
    title: string
    text?: string
    action?: ReactNode
}) {
    return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon size={26} />
      </span>
      <p className="mt-4 font-semibold text-slate-900">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
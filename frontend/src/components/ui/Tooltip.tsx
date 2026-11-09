import type { ReactNode } from "react";

export default function Tooltip({ text, children }: { text: string; children: ReactNode }){
    return (
      <span className="group relative inline-flex">
        {children}
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-focus-within:opacity-100 group-hover:opacity-100"
        >
          {text}
        </span>
      </span>
    );
}
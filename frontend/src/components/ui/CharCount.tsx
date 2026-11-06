import { hasMarkup } from '@/lib/sanitize'

export default function CharConut({ value, max }: { value: string; max: number }){
    const length = value.length
    const ratio = length / max

    let message = ''
    if(hasMarkup(value)) message = 'HTML tags such as <b> or <script> are not allowed'
    else if (length > 0 && !value.trim()) message = 'This field cannot contain only spaces'

    const tone = ratio >= 1 ? 'font-medium text-rose-600' : ratio > 0.9 ? 'text-amber-600' : 'text-slate-400'

    return (
      <span className="mt-1 flex items-start justify-between gap-3 text-xs font-normal">
        <span className="text-rose-600" role={message ? 'alert' : undefined}>
          {message}
        </span>
        <span className={`ml-auto shrink-0 tabular-nums ${tone}`}>
          {length} / {max}
          {ratio >= 1 ? ' · limit reached' : ''}
        </span>
      </span>
    );
}
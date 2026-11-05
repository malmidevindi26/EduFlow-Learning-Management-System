export default function ProgressBar({
    value,
    className = '',
}: {
    value: number
    className?: string
}){
    const width = Math.min(100, Math.max(0, value))
    return (
        <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{ width: `${width}%` }}
      />
    </div>
    )
}
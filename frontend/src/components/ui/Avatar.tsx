const TONES = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
]

export default function Avatar({ name, size = 36 }: { name: string; size?: number }){
    const tone = TONES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length]

    return(
      <span
        aria-hidden
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${tone}`}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    )
}
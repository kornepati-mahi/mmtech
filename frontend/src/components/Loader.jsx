import { Loader2 } from 'lucide-react'

export default function Loader({ text = 'Loading…', full = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        full ? 'min-h-[50vh]' : 'rounded-3xl border border-ink-100 bg-white px-6 py-14'
      }`}
    >
      <span className="relative grid h-12 w-12 place-items-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/20" />
        <Loader2 size={26} className="animate-spin text-brand-600" />
      </span>
      <span className="text-sm font-medium text-ink-400">{text}</span>
    </div>
  )
}

/** Card-shaped skeleton grid used while lists load. */
export function SkeletonGrid({ count = 3, className = '' }) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-3xl border border-ink-100 bg-white p-6"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <div className="mb-4 h-12 w-12 rounded-2xl bg-ink-100" />
          <div className="mb-2 h-4 w-2/3 rounded-full bg-ink-100" />
          <div className="mb-2 h-3 w-full rounded-full bg-ink-50" />
          <div className="h-3 w-4/5 rounded-full bg-ink-50" />
        </div>
      ))}
    </div>
  )
}

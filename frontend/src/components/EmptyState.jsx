import { Inbox } from 'lucide-react'

export default function EmptyState({ text = 'Nothing here yet.', title, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink-50 text-ink-400">
        <Inbox size={24} />
      </span>
      {title && <h3 className="mb-1 font-display text-lg font-bold text-ink-800">{title}</h3>}
      <p className="max-w-md text-sm text-ink-500">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

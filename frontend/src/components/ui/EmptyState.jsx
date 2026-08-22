import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'Nothing to show yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border-subtle bg-surface px-6 py-12 text-center">
      <Inbox size={22} className="text-ink-muted" strokeWidth={1.5} />
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  )
}

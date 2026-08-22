import { AlertTriangle } from 'lucide-react'
import Button from './Button.jsx'

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-border-subtle bg-surface px-6 py-12 text-center">
      <AlertTriangle size={22} className="text-danger" strokeWidth={1.5} />
      <p className="text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

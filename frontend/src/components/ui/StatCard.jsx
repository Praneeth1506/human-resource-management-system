export default function StatCard({ label, value, hint, tone = 'default' }) {
  const toneClasses = {
    default: 'text-ink',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
  }

  return (
    <div className="rounded-card border border-border-subtle bg-surface p-5 shadow-card">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

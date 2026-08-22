const STATUS_STYLES = {
  present: 'bg-success-soft text-success',
  approved: 'bg-success-soft text-success',
  late: 'bg-warning-soft text-warning',
  pending: 'bg-warning-soft text-warning',
  absent: 'bg-danger-soft text-danger',
  rejected: 'bg-danger-soft text-danger',
  leave: 'bg-info-soft text-info',
  half_day: 'bg-info-soft text-info',
}

const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  half_day: 'Half Day',
  leave: 'Leave',
  late: 'Late',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase()
  const style = STATUS_STYLES[key] ?? 'bg-black/5 text-ink-muted'
  const label = STATUS_LABELS[key] ?? status

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  )
}

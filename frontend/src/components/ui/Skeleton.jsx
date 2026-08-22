export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-black/5 ${className}`} />
}

export function CardSkeleton({ className = '' }) {
  return (
    <div className={`rounded-card border border-border-subtle bg-surface p-5 shadow-card ${className}`}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function TableContainer({ children }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function Table({ children }) {
  return <table className="w-full min-w-max border-collapse text-sm">{children}</table>
}

export function THead({ columns }) {
  return (
    <thead>
      <tr className="border-b border-border-subtle text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
        {columns.map((col) => (
          <th key={col} className="whitespace-nowrap px-3 py-2.5 first:pl-1 last:pr-1">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export function Td({ className = '', children }) {
  return (
    <td className={`whitespace-nowrap px-3 py-3 text-ink first:pl-1 last:pr-1 ${className}`}>
      {children}
    </td>
  )
}

export function Tr({ children }) {
  return <tr className="border-b border-border-subtle last:border-0">{children}</tr>
}

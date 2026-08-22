const fieldClasses =
  'w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'

export function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({ id, error, className = '', ...props }) {
  return (
    <input
      id={id}
      aria-invalid={Boolean(error)}
      className={`${fieldClasses} ${error ? 'border-danger' : 'border-border-subtle'} ${className}`}
      {...props}
    />
  )
}

export function TextArea({ id, error, className = '', ...props }) {
  return (
    <textarea
      id={id}
      aria-invalid={Boolean(error)}
      className={`${fieldClasses} min-h-24 resize-y ${error ? 'border-danger' : 'border-border-subtle'} ${className}`}
      {...props}
    />
  )
}

export function Select({ id, error, className = '', children, ...props }) {
  return (
    <select
      id={id}
      aria-invalid={Boolean(error)}
      className={`${fieldClasses} ${error ? 'border-danger' : 'border-border-subtle'} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

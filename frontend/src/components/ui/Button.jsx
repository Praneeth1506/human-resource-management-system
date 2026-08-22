const variants = {
  primary:
    'bg-teal-700 text-white hover:bg-teal-800 focus-visible:outline-teal-700',
  secondary:
    'bg-surface text-ink border border-border-subtle hover:bg-workspace focus-visible:outline-teal-700',
  ghost:
    'bg-transparent text-ink-soft hover:bg-black/5 focus-visible:outline-teal-700',
  danger:
    'bg-danger text-white hover:opacity-90 focus-visible:outline-danger',
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

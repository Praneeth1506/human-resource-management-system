import Card from './Card.jsx'

export default function SectionCard({ title, description, actions, className = '', children }) {
  return (
    <Card className={`p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </Card>
  )
}

import { Menu, Bell } from 'lucide-react'

const employee = {
  name: 'Arun Kumar',
  designation: 'Software Developer',
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border-subtle bg-workspace-alt/90 px-4 py-3 backdrop-blur sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-soft hover:bg-black/5 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block" />


      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-full p-2 text-ink-soft hover:bg-black/5"
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface py-1 pl-1 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
            {initials(employee.name)}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:inline">
            {employee.name}
          </span>
        </div>
      </div>
    </header>
  )
}

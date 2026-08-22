import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Clock,
  CalendarDays,
  Wallet,
  UserRound,
  Settings,
  Waves,
} from 'lucide-react'

const primaryNav = [
  { label: 'Dashboard', icon: LayoutGrid, to: null },
  { label: 'Attendance', icon: Clock, to: '/attendance' },
  { label: 'Leave', icon: CalendarDays, to: '/leave' },
  { label: 'Payroll', icon: Wallet, to: '/payroll' },
  { label: 'Profile', icon: UserRound, to: null },
]

const secondaryNav = [{ label: 'Settings', icon: Settings, to: null }]

function NavItem({ label, icon: Icon, to }) {
  const baseClasses =
    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors'

  if (!to) {
    return (
      <div
        className={`${baseClasses} cursor-not-allowed text-teal-500/50`}
        title="Coming soon"
        aria-disabled="true"
      >
        <Icon size={18} strokeWidth={2} />
        <span>{label}</span>
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseClasses} ${
          isActive
            ? 'bg-teal-600 text-white shadow-sm'
            : 'text-teal-100/70 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon size={18} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-teal-950 px-4 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:h-svh lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Waves size={18} strokeWidth={2.5} />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            Dayflow
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {primaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
          {secondaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>
      </aside>
    </>
  )
}

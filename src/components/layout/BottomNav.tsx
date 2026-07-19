import { NavLink } from 'react-router'

const navItems = [
  { to: '/', label: 'Översikt', end: true },
  { to: '/calendar', label: 'Kalender', end: false },
  { to: '/profile', label: 'Profil', end: false },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  isActive ? 'text-accent' : 'text-ink-secondary'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import { NavLink } from 'react-router'
import { House, UtensilsCrossed, Dumbbell, User } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Hem', end: true, Icon: House },
  { to: '/nutrition', label: 'Kost', end: false, Icon: UtensilsCrossed },
  { to: '/training', label: 'Träning', end: false, Icon: Dumbbell },
  { to: '/profile', label: 'Profil', end: false, Icon: User },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {navItems.map(({ to, label, end, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={end} className="press flex flex-col items-center gap-1 py-2.5 text-xs font-medium">
              {({ isActive }) => (
                <>
                  <span
                    className={`flex items-center justify-center rounded-full px-3.5 py-1 transition-colors duration-200 ${
                      isActive ? 'bg-accent-light text-accent' : 'text-ink-secondary'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
                  </span>
                  <span className={isActive ? 'text-accent' : 'text-ink-secondary'}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

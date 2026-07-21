import { Outlet, useLocation } from 'react-router'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-svh bg-surface-muted">
      <main className="mx-auto max-w-md px-4 pb-24 pt-6">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

const OWNER_EMAIL = 'hugoback06@gmail.com'

export function RequireOwner() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (session?.user.email !== OWNER_EMAIL) return <Navigate to="/" replace />

  return <Outlet />
}

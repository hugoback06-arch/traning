import { Navigate, Outlet } from 'react-router'
import { useProfile } from '../../hooks/useProfile'

export function OnboardingGate() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) return null
  if (profile && !profile.onboarding_completed_at) return <Navigate to="/onboarding" replace />

  return <Outlet />
}

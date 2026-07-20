import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './theme-context'
import { useProfile } from '../hooks/useProfile'
import { useUpdateThemePreference } from '../hooks/useUpdateThemePreference'
import type { ThemePreference } from '../types/domain'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile()
  const updateThemePreference = useUpdateThemePreference()
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme)

  useEffect(() => {
    if (profile) setPreferenceState(profile.theme_preference)
  }, [profile])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemTheme(mql.matches ? 'dark' : 'light')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = preference === 'system' ? systemTheme : preference

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  function setPreference(next: ThemePreference) {
    setPreferenceState(next)
    updateThemePreference.mutate(next)
  }

  return <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>{children}</ThemeContext.Provider>
}

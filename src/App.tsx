import { BrowserRouter, Route, Routes } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { RequireAuth } from './components/layout/RequireAuth'
import { OnboardingGate } from './components/layout/OnboardingGate'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './routes/LoginPage'
import { OnboardingPage } from './routes/OnboardingPage'
import { DailyOverviewPage } from './routes/DailyOverviewPage'
import { CalendarPage } from './routes/CalendarPage'
import { ProfileSettingsPage } from './routes/ProfileSettingsPage'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route element={<OnboardingGate />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<DailyOverviewPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/profile" element={<ProfileSettingsPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

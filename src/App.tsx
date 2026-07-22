import { BrowserRouter, Route, Routes } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeProvider'
import { RequireAuth } from './components/layout/RequireAuth'
import { OnboardingGate } from './components/layout/OnboardingGate'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './routes/LoginPage'
import { OnboardingPage } from './routes/OnboardingPage'
import { Home } from './routes/Home'
import { DailyOverviewPage } from './routes/DailyOverviewPage'
import { CalendarPage } from './routes/CalendarPage'
import { SavedMealsPage } from './routes/SavedMealsPage'
import { ProfileSettingsPage } from './routes/ProfileSettingsPage'
import { TrainingPage } from './routes/training/TrainingPage'
import { SchedulePage } from './routes/training/SchedulePage'
import { History } from './routes/training/History'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAuth />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route element={<OnboardingGate />}>
                  <Route element={<AppShell />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/nutrition" element={<DailyOverviewPage />} />
                    <Route path="/nutrition/calendar" element={<CalendarPage />} />
                    <Route path="/nutrition/saved-meals" element={<SavedMealsPage />} />
                    <Route path="/training" element={<TrainingPage />} />
                    <Route path="/training/schedule" element={<SchedulePage />} />
                    <Route path="/training/history" element={<History />} />
                    <Route path="/profile" element={<ProfileSettingsPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

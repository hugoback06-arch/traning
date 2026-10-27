import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeProvider'
import { RequireAuth } from './components/layout/RequireAuth'
import { RequireOwner } from './components/layout/RequireOwner'
import { OnboardingGate } from './components/layout/OnboardingGate'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './routes/LoginPage'
import { Home } from './routes/Home'

// Keep login and home in the initial bundle. The remaining pages load when
// visited, so calendar, charts and admin code do not delay app startup.
const OnboardingPage = lazy(() => import('./routes/OnboardingPage').then((module) => ({ default: module.OnboardingPage })))
const DailyOverviewPage = lazy(() => import('./routes/DailyOverviewPage').then((module) => ({ default: module.DailyOverviewPage })))
const CalendarPage = lazy(() => import('./routes/CalendarPage').then((module) => ({ default: module.CalendarPage })))
const SavedMealsPage = lazy(() => import('./routes/SavedMealsPage').then((module) => ({ default: module.SavedMealsPage })))
const ProfileSettingsPage = lazy(() => import('./routes/ProfileSettingsPage').then((module) => ({ default: module.ProfileSettingsPage })))
const RecipesPage = lazy(() => import('./routes/RecipesPage').then((module) => ({ default: module.RecipesPage })))
const AdminAiEvalPage = lazy(() => import('./routes/AdminAiEvalPage').then((module) => ({ default: module.AdminAiEvalPage })))
const AdminFeedbackPage = lazy(() => import('./routes/AdminFeedbackPage').then((module) => ({ default: module.AdminFeedbackPage })))

function RouteLoadingFallback() {
  return <div className="min-h-32" aria-label="Laddar sida" />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Suspense fallback={<RouteLoadingFallback />}>
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



                    <Route path="/recipes" element={<RecipesPage />} />
                    <Route path="/profile" element={<ProfileSettingsPage />} />
                    <Route element={<RequireOwner />}>
                      <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
                      <Route path="/admin/ai-eval" element={<AdminAiEvalPage />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
              </Routes>
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

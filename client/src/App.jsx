import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'

// Pages - code-splitting via React.lazy
const Login = lazy(() => import('./components/Auth/Login'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const CasesPage = lazy(() => import('./pages/CasesPage'))
const VictimsPage = lazy(() => import('./pages/VictimsPage'))
const PerpetratorsPage = lazy(() => import('./pages/PerpetratorsPage'))
const ChildrenPage = lazy(() => import('./pages/ChildrenPage'))
const IncidentsPage = lazy(() => import('./pages/IncidentsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const Unauthorized = lazy(() => import('./pages/Unauthorized'))
const Settings = lazy(() => import('./pages/Settings'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

// If you have ProfilePage, add it too
import ProfilePage from './pages/ProfilePage'

// Layout
import MainLayout from './components/Layout/MainLayout'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes with MainLayout - ALL routes inside require auth */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Case Management */}
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/cases/:id" element={<CasesPage />} />
              <Route path="/victims" element={<VictimsPage />} />
              <Route path="/perpetrators" element={<PerpetratorsPage />} />
              <Route path="/children" element={<ChildrenPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              
              {/* Profile Page - if you want it */}
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Admin-only Routes - Nested within ProtectedRoute */}
              <Route element={<RoleProtectedRoute allowedRoles={['system_admin', 'admin']} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
          
          {/* Redirect to dashboard for any other route for now */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
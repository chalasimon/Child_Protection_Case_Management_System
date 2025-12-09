import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'

// Pages - Using YOUR actual file names from the Explorer
import Login from './components/Auth/Login'
import DashboardPage from './pages/DashboardPage'           // Changed from Dashboard
import UsersPage from './pages/UsersPage'                   // Changed from Users
import CasesPage from './pages/CasesPage'                   // Changed from Cases
import VictimsPage from './pages/VictimsPage'               // Changed from Victims
import PerpetratorsPage from './pages/PerpetratorsPage'     // Changed from Perpetrators
import ChildrenPage from './pages/ChildrenPage'             // Keep as ChildrenPage
import IncidentsPage from './pages/IncidentsPage'           // Changed from Incidents
import ReportsPage from './pages/ReportsPage'               // Changed from Reports
import Unauthorized from './pages/Unauthorized'
import Settings from './pages/Settings'
import LandingPage from './pages/LandingPage'

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
      <BrowserRouter>
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
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
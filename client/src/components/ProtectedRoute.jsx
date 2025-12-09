// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute() {
  // Access the auth state from Redux
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // If authenticated, render the child routes
  return <Outlet />
}

export default ProtectedRoute
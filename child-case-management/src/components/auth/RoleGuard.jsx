import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RoleGuard.css';

/**
 * RoleGuard component to protect routes based on user roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if user has required role
 * @param {Array<string>} props.allowedRoles - Array of role names that can access the route
 * @param {string} props.fallbackPath - Path to redirect if user doesn't have permission (default: '/dashboard')
 * @param {boolean} props.showForbiddenPage - Whether to show a custom forbidden page instead of redirecting
 */
const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard',
  showForbiddenPage = false 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="tw-fixed tw-inset-0 tw-bg-gray-50 tw-bg-opacity-75 tw-flex tw-flex-col tw-items-center tw-justify-center">
        <div className="tw-animate-spin tw-rounded-full tw-h-16 tw-w-16 tw-border-t-4 tw-border-b-4 tw-border-indigo-600"></div>
        <p className="tw-mt-4 tw-text-lg tw-font-medium tw-text-gray-700">
          Checking permissions...
        </p>
        <p className="tw-mt-2 tw-text-sm tw-text-gray-500">
          Please wait while we verify your access
        </p>
      </div>
    );
  }

  // If user is not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = user && allowedRoles.includes(user.role);

  // If user has required role, render children
  if (hasRequiredRole) {
    return <>{children}</>;
  }

  // If showForbiddenPage is true, display custom forbidden page
  if (showForbiddenPage) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-flex-col tw-justify-center tw-py-12 sm:tw-px-6 lg:tw-px-8">
        <div className="sm:tw-mx-auto sm:tw-w-full sm:tw-max-w-md">
          <div className="tw-text-center">
            <div className="tw-mx-auto tw-flex tw-items-center tw-justify-center tw-h-24 tw-w-24 tw-rounded-full tw-bg-red-100">
              <svg 
                className="tw-h-12 tw-w-12 tw-text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </div>
            <h2 className="tw-mt-6 tw-text-3xl tw-font-extrabold tw-text-gray-900">
              Access Denied
            </h2>
            <p className="tw-mt-2 tw-text-sm tw-text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
          
          <div className="tw-mt-8 tw-bg-white tw-py-8 tw-px-4 tw-shadow sm:tw-rounded-lg sm:tw-px-10">
            <div className="tw-text-center">
              <h3 className="tw-text-lg tw-font-medium tw-text-gray-900 tw-mb-4">
                Required Role{s}: 
                <span className="tw-text-indigo-600 tw-ml-2">
                  {allowedRoles.join(', ')}
                </span>
              </h3>
              
              <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-mb-6">
                <p className="tw-text-sm tw-font-medium tw-text-gray-700">Your Role:</p>
                <p className="tw-text-lg tw-font-bold tw-text-indigo-600 tw-mt-1">
                  {user?.role || 'No Role Assigned'}
                </p>
              </div>

              <div className="tw-space-y-3">
                <button
                  onClick={() => window.history.back()}
                  className="tw-w-full tw-flex tw-justify-center tw-py-2 tw-px-4 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500"
                >
                  Go Back
                </button>
                
                <button
                  onClick={() => window.location.href = fallbackPath}
                  className="tw-w-full tw-flex tw-justify-center tw-py-2 tw-px-4 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-indigo-600 hover:tw-bg-indigo-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default behavior: redirect to fallback path
  return <Navigate to={fallbackPath} replace />;
};

export default RoleGuard;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';


const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call login function from AuthContext
      await login(email, password, rememberMe);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  //
  return (
    <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-purple-50 tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4">
      <div className="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-md tw-overflow-hidden">
        {/* Header */}
        <div className="tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 tw-p-6">
          <h2 className="tw-text-white tw-text-2xl tw-font-bold tw-text-center">
            Child Abuse Case System
          </h2>
          <p className="tw-text-indigo-200 tw-text-center tw-mt-2">
            Protecting Children, Securing Futures
          </p>
        </div>

        {/* Form */}
        <div className="tw-p-8">
          <h3 className="tw-text-gray-800 tw-text-xl tw-font-semibold tw-mb-6 tw-text-center">
            Sign In to Your Account
          </h3>
          
          {error && (
            <div className="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-p-4 tw-mb-6 tw-rounded">
              <div className="tw-flex">
                <div className="tw-flex-shrink-0">
                  <svg className="tw-h-5 tw-w-5 tw-text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="tw-ml-3">
                  <p className="tw-text-sm tw-text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="tw-space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                Email Address
              </label>
              <div className="tw-relative">
                <div className="tw-absolute tw-inset-y-0 tw-left-0 tw-pl-3 tw-flex tw-items-center tw-pointer-events-none">
                  <svg className="tw-h-5 tw-w-5 tw-text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  className="tw-block tw-w-full tw-pl-10 tw-pr-3 tw-py-3 tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-indigo-500 disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                Password
              </label>
              <div className="tw-relative">
                <div className="tw-absolute tw-inset-y-0 tw-left-0 tw-pl-3 tw-flex tw-items-center tw-pointer-events-none">
                  <svg className="tw-h-5 tw-w-5 tw-text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="tw-block tw-w-full tw-pl-10 tw-pr-3 tw-py-3 tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-indigo-500 disabled:tw-bg-gray-100 disabled:tw-cursor-not-allowed"
                />
              </div>
            </div>

            {/* Options */}
            <div className="tw-flex tw-items-center tw-justify-between">
              <div className="tw-flex tw-items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="tw-h-4 tw-w-4 tw-text-indigo-600 focus:tw-ring-indigo-500 tw-border-gray-300 tw-rounded"
                />
                <label htmlFor="remember" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-700">
                  Remember me
                </label>
              </div>
              <a 
                href="/forgot-password" 
                className="tw-text-sm tw-font-medium tw-text-indigo-600 hover:tw-text-indigo-500"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="tw-w-full tw-flex tw-justify-center tw-py-3 tw-px-4 tw-border tw-border-transparent tw-rounded-lg tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 hover:tw-from-indigo-700 hover:tw-to-purple-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="tw-animate-spin tw--ml-1 tw-mr-3 tw-h-5 tw-w-5 tw-text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="tw-mt-8 tw-pt-6 tw-border-t tw-border-gray-200">
            <h4 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-mb-3">Demo Credentials:</h4>
            <div className="tw-space-y-2">
              <div className="tw-flex tw-items-center">
                <div className="tw-h-2 tw-w-2 tw-rounded-full tw-bg-indigo-500 tw-mr-2"></div>
                <span className="tw-text-sm">
                  <span className="tw-font-medium">Admin:</span> admin@system.com / admin123
                </span>
              </div>
              <div className="tw-flex tw-items-center">
                <div className="tw-h-2 tw-w-2 tw-rounded-full tw-bg-purple-500 tw-mr-2"></div>
                <span className="tw-text-sm">
                  <span className="tw-font-medium">Director:</span> director@system.com / director123
                </span>
              </div>
              <div className="tw-flex tw-items-center">
                <div className="tw-h-2 tw-w-2 tw-rounded-full tw-bg-pink-500 tw-mr-2"></div>
                <span className="tw-text-sm">
                  <span className="tw-font-medium">Focal Person:</span> focal@system.com / focal123
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tw-bg-gray-50 tw-px-8 tw-py-4 tw-text-center">
          <p className="tw-text-xs tw-text-gray-500">
            For security reasons, please log out and close your browser when finished.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
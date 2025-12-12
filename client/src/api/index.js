import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  // Token-based auth (Bearer). Cookie-based Sanctum auth requires a different backend login flow.
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // If Laravel returns data property, extract it
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data
    }
    return response.data || response
  },
  (error) => {
    const sanitizeErrorMessage = (message, status) => {
      const msg = typeof message === 'string' ? message : ''
      const lower = msg.toLowerCase()

      // Never leak database details to the UI.
      if (msg.includes('SQLSTATE') || lower.includes('mysql') || lower.includes('pdoexception')) {
        return 'Service temporarily unavailable. Please try again later.'
      }

      // Common infra/backend down cases.
      if (status === 503) {
        return 'Service temporarily unavailable. Please try again later.'
      }

      return message
    }

    // Simple retry for transient timeouts or network errors
    const config = error.config || {}
    const shouldRetry =
      (error.code === 'ECONNABORTED' || !error.response) && (config.method === 'get')
    const retryCount = config.__retryCount || 0
    const maxRetries = 2

    if (shouldRetry && retryCount < maxRetries) {
      config.__retryCount = retryCount + 1
      const backoffMs = 1000 * Math.pow(2, retryCount) // 1s, 2s
      return new Promise((resolve) => setTimeout(resolve, backoffMs)).then(() => api(config))
    }

    const rawMessage = error.response?.data?.message || error.message
    const status = error.response?.status
    const errorMessage = sanitizeErrorMessage(rawMessage, status)
    const errorData = {
      message: errorMessage,
      status,
      errors: error.response?.data?.errors || null,
      original: error,
    }

    console.error('API Error:', errorData)

    // Handle unauthorized (token expired/invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(errorData)
  }
)

export default api

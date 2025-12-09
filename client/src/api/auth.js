import api from './index'

export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  
  // Optional: Test method
  testConnection: () => api.get('/health').catch(() => ({ 
    status: 'offline', 
    message: 'API not reachable' 
  }))
}
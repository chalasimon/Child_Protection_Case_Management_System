import api from './index'

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentCases: () => api.get('/cases', { params: { per_page: 10 } }),
}
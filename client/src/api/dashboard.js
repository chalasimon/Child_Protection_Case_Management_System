// api/dashboard.js
import api from './index'

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAbuseTypeStats: () => api.get('/dashboard/abuse-type-stats'),
  getRecentCases: () => api.get('/dashboard/recent-cases'),
  getYearlyStats: (year) => api.get('/dashboard/yearly-stats', { params: { year } }),
  getMonthlyStats: (year, month) => api.get('/dashboard/monthly-stats', { params: { year, month } }),
  getPriorityStats: () => api.get('/dashboard/priority-stats'),
}
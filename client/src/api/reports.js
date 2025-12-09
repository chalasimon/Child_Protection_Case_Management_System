import api from './index'

export const reportApi = {
  generateCasesReport: (params) => api.get('/reports/cases', { params }),
  generateVictimsReport: (params) => api.get('/reports/victims', { params }),
  generatePerpetratorsReport: (params) => api.get('/reports/perpetrators', { params }),
}
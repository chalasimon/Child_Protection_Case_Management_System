// reportApi.js - UPDATED VERSION
import api from './index'

export const reportApi = {
  generateReport: (params) => api.get('/reports/generate', { params }),
  generateCasesReport: (params) => api.get('/reports/cases', { params }),
  generateVictimsReport: (params) => api.get('/reports/victims', { params }),
  generatePerpetratorsReport: (params) => api.get('/reports/perpetrators', { params }),
  generateIncidentReport: (params) => api.get('/reports/incidents', { params }),
  generateComprehensiveReport: (params) => api.get('/reports/comprehensive', { params }),
}
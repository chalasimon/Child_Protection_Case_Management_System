import api from './index'

export const victimApi = {
  getVictims: (params) => api.get('/victims', { params }),
  getVictim: (id) => api.get(`/victims/${id}`),
  createVictim: (data) => api.post('/victims', data),
  updateVictim: (id, data) => api.put(`/victims/${id}`, data),
  deleteVictim: (id) => api.delete(`/victims/${id}`),
}
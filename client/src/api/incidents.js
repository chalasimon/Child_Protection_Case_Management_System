import api from './index'

export const incidentApi = {
  getIncidents: () => api.get('/incidents'),
  getIncident: (id) => api.get(`/incidents/${id}`),
  createIncident: (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'evidence_files' && data[key]) {
        data[key].forEach(file => {
          formData.append('evidence_files[]', file)
        })
      } else {
        formData.append(key, data[key])
      }
    })
    
    return api.post('/incidents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  updateIncident: (id, data) => api.put(`/incidents/${id}`, data),
  deleteIncident: (id) => api.delete(`/incidents/${id}`),
  uploadAttachments: (id, files) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('evidence_files[]', file)
    })
    
    return api.post(`/incidents/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  removeAttachment: (id, filename) => 
    api.delete(`/incidents/${id}/attachments`, { data: { filename } }),
  downloadAttachment: (id, filename) => 
    api.get(`/incidents/${id}/attachments/download`, { 
      params: { filename },
      responseType: 'blob' 
    }),
}
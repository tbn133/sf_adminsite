import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'your-secret-admin-api-key-here'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': ADMIN_API_KEY,
  },
})

// Admin API
export const adminAPI = {
  getDevices: () => apiClient.get('/admin/devices'),
  getDeviceLogs: (deviceId, days = 7) =>
    apiClient.get(`/admin/devices/${deviceId}/logs`, { params: { days } }),
  getSchedules: () => apiClient.get('/admin/schedules'),
  getRules: () => apiClient.get('/admin/rules'),
  getStats: () => apiClient.get('/admin/stats'),
  controlDevice: (deviceId, command) => apiClient.post(`/admin/control/${deviceId}`, command),
  resetDevice: deviceId => apiClient.post(`/admin/devices/${deviceId}/reset`),
  get: endpoint => apiClient.get(endpoint),
  post: (endpoint, data, config) => apiClient.post(endpoint, data, config),
}

// Sensors API
export const sensorsAPI = {
  getLatest: deviceId => apiClient.get(`/api/sensors/${deviceId}`),
  getHistory: (deviceId, hours = 24, limit = 100) =>
    apiClient.get(`/api/sensors/${deviceId}/history`, { params: { hours, limit } }),
}

// Control API
export const controlAPI = {
  sendCommand: (deviceId, command) => apiClient.post(`/api/control/${deviceId}`, command),
  getHistory: (deviceId, limit = 50) =>
    apiClient.get(`/api/control/${deviceId}/history`, { params: { limit } }),
}

// Schedules API
export const schedulesAPI = {
  getAll: () => apiClient.get('/api/schedules'),
  getOne: scheduleId => apiClient.get(`/api/schedules/${scheduleId}`),
  create: schedule => apiClient.post('/api/schedules', schedule),
  update: (scheduleId, schedule) => apiClient.put(`/api/schedules/${scheduleId}`, schedule),
  delete: scheduleId => apiClient.delete(`/api/schedules/${scheduleId}`),
  assignToDevice: (scheduleId, deviceId) =>
    apiClient.post(`/api/schedules/${scheduleId}/assign/${deviceId}`),
}

// Rules API
export const rulesAPI = {
  getByDevice: deviceId => apiClient.get(`/api/rules/device/${deviceId}`),
  getOne: ruleId => apiClient.get(`/api/rules/${ruleId}`),
  create: rule => apiClient.post('/api/rules', rule),
  update: (ruleId, rule) => apiClient.put(`/api/rules/${ruleId}`, rule),
  delete: ruleId => apiClient.delete(`/api/rules/${ruleId}`),
  toggle: ruleId => apiClient.patch(`/api/rules/${ruleId}/toggle`),
}

// Export API
export const exportAPI = {
  exportCSV: (deviceId, days = 7) =>
    apiClient.get('/api/export/csv', {
      params: { device_id: deviceId, days },
      responseType: 'blob',
    }),
  exportStats: (deviceId, days = 7) =>
    apiClient.get('/api/export/stats', { params: { device_id: deviceId, days } }),
}

// Pairing API
export const pairingAPI = {
  getPending: () => apiClient.get('/admin/pairings/pending'),
  approve: (pairingId, data) => apiClient.post(`/admin/pairings/${pairingId}/approve`, data),
  reject: (pairingId, reason) => apiClient.post(`/admin/pairings/${pairingId}/reject`, { reason }),
}

export default apiClient

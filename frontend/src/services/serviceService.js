import { apiRequest } from './api';

export const serviceService = {
  getAll: async (all = true) => apiRequest(`/servicios${all ? '?all=true' : ''}`),
  getServices: async (all = true) => apiRequest(`/servicios${all ? '?all=true' : ''}`),
  getById: async (id) => apiRequest(`/servicios/${id}`),
  getServiceById: async (id) => apiRequest(`/servicios/${id}`),
  create: async (data) => apiRequest('/servicios', { method: 'POST', body: data }),
  createService: async (data) => apiRequest('/servicios', { method: 'POST', body: data }),
  update: async (id, data) => apiRequest(`/servicios/${id}`, { method: 'PUT', body: data }),
  updateService: async (id, data) => apiRequest(`/servicios/${id}`, { method: 'PUT', body: data }),
  changeStatus: async (id, estado) => apiRequest(`/servicios/${id}/status`, { method: 'PATCH', body: { estado } }),
  delete: async (id) => apiRequest(`/servicios/${id}`, { method: 'DELETE' }),
  deleteService: async (id) => apiRequest(`/servicios/${id}`, { method: 'DELETE' }),
};

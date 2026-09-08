import { apiRequest } from './api';

export const userService = {
  getAll: async () => apiRequest('/usuarios'),
  getUsers: async () => apiRequest('/usuarios'),
  getById: async (id) => apiRequest(`/usuarios/${id}`),
  getUserById: async (id) => apiRequest(`/usuarios/${id}`),
  create: async (data) => apiRequest('/usuarios', { method: 'POST', body: data }),
  createUser: async (data) => apiRequest('/usuarios', { method: 'POST', body: data }),
  update: async (id, data) => apiRequest(`/usuarios/${id}`, { method: 'PUT', body: data }),
  updateUser: async (id, data) => apiRequest(`/usuarios/${id}`, { method: 'PUT', body: data }),
  changeStatus: async (id, estado) => apiRequest(`/usuarios/${id}/estado`, { method: 'PATCH', body: { estado } }),
  delete: async (id) => apiRequest(`/usuarios/${id}`, { method: 'DELETE' }),
  deleteUser: async (id) => apiRequest(`/usuarios/${id}`, { method: 'DELETE' }),
};


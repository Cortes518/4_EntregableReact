import { apiRequest } from './api';

export const userService = {
  getAll: async () => apiRequest('/users'),
  getUsers: async () => apiRequest('/users'),
  getById: async (id) => apiRequest(`/users/${id}`),
  getUserById: async (id) => apiRequest(`/users/${id}`),
  create: async (data) => apiRequest('/users', { method: 'POST', body: data }),
  createUser: async (data) => apiRequest('/users', { method: 'POST', body: data }),
  update: async (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: data }),
  updateUser: async (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: data }),
  changeStatus: async (id, estado) => apiRequest(`/users/${id}/status`, { method: 'PATCH', body: { estado } }),
  delete: async (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  deleteUser: async (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

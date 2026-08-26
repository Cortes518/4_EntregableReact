import { apiRequest } from './api';

export const productService = {
  getAll: async (all = true) => apiRequest(`/productos${all ? '?all=true' : ''}`),
  getProducts: async (all = true) => apiRequest(`/productos${all ? '?all=true' : ''}`),
  getById: async (id) => apiRequest(`/productos/${id}`),
  getProductById: async (id) => apiRequest(`/productos/${id}`),
  create: async (data) => apiRequest('/productos', { method: 'POST', body: data }),
  createProduct: async (data) => apiRequest('/productos', { method: 'POST', body: data }),
  update: async (id, data) => apiRequest(`/productos/${id}`, { method: 'PUT', body: data }),
  updateProduct: async (id, data) => apiRequest(`/productos/${id}`, { method: 'PUT', body: data }),
  changeStatus: async (id, estado) => apiRequest(`/productos/${id}/status`, { method: 'PATCH', body: { estado } }),
  delete: async (id) => apiRequest(`/productos/${id}`, { method: 'DELETE' }),
  deleteProduct: async (id) => apiRequest(`/productos/${id}`, { method: 'DELETE' }),
};

import { apiRequest } from './api';

export const pqrService = {
  /**
   * Listar PQRs. Admin/Empleado ven todas, Cliente solo las suyas.
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.estado) queryParams.append('estado', params.estado);

    const queryString = queryParams.toString();
    const endpoint = `/pqrs${queryString ? '?' + queryString : ''}`;
    return apiRequest(endpoint);
  },

  /**
   * Obtener detalle de una PQR por ID.
   */
  getById: async (id) => {
    return apiRequest(`/pqrs/${id}`);
  },

  /**
   * Crear una nueva PQR.
   */
  create: async (data) => {
    return apiRequest('/pqrs', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Actualizar estado y/o respuesta de una PQR (Admin/Empleado).
   */
  update: async (id, data) => {
    return apiRequest(`/pqrs/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Eliminar una PQR (solo Admin).
   */
  delete: async (id) => {
    return apiRequest(`/pqrs/${id}`, {
      method: 'DELETE',
    });
  },
};

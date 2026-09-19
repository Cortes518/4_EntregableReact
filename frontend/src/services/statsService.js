import { apiRequest } from './api';

export const statsService = {
  /**
   * Obtener estadísticas consolidadas del dashboard.
   * Admin/Empleado: totales globales. Cliente: datos personales.
   */
  getDashboardStats: async () => {
    return apiRequest('/estadisticas/dashboard');
  },

  /**
   * Obtener datos de ventas agrupados para gráficos.
   * @param {Object} params - { agrupacion: 'dia'|'semana'|'mes', fecha_inicio, fecha_fin }
   */
  getSalesChart: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.agrupacion) queryParams.append('agrupacion', params.agrupacion);
    if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
    if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);

    const queryString = queryParams.toString();
    const endpoint = `/estadisticas/ventas-chart${queryString ? '?' + queryString : ''}`;
    return apiRequest(endpoint);
  },

  /**
   * Obtener estadísticas personales del cliente autenticado.
   */
  getMyStats: async () => {
    return apiRequest('/estadisticas/mis-estadisticas');
  },
};

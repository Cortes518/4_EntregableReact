import { apiRequest } from './api';

export const saleService = {
  // Registrar una nueva venta
  async createSale(saleData) {
    return await apiRequest('/ventas', { method: 'POST', body: saleData });
  },

  // Listar historial de ventas con filtros opcionales
  async getSales(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    const endpoint = queryString ? `/ventas?${queryString}` : '/ventas';
    return await apiRequest(endpoint);
  },

  // Obtener consolidado de reporte diario
  async getDailyReport(fecha) {
    const endpoint = fecha ? `/ventas/reporte-diario?fecha=${fecha}` : '/ventas/reporte-diario';
    return await apiRequest(endpoint);
  },

  // Obtener compras y facturas del cliente autenticado
  async getMyPurchases() {
    return await apiRequest('/ventas/mis-compras');
  },

  // Obtener detalle de venta por ID
  async getSaleById(idVenta) {
    return await apiRequest(`/ventas/${idVenta}`);
  },

  // Buscar factura por número (ej: FAC-20260918-0001)
  async getSaleByInvoice(numeroFactura) {
    return await apiRequest(`/ventas/factura/${numeroFactura}`);
  },
};


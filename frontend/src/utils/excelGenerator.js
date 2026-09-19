import * as XLSX from 'xlsx';

/**
 * Genera y descarga el Reporte Diario de Ventas en formato Excel (.xlsx)
 */
export function generarReporteDiarioExcel(reporteData, fecha) {
  const wb = XLSX.utils.book_new();

  // 1. Datos de Encabezado y Resumen
  const headerData = [
    ['PCORTES — REPORTE DIARIO DE VENTAS'],
    ['Soluciones Tecnológicas & Ensamble de Alto Rendimiento'],
    ['NIT: 901.458.789-2 | Tel: (57) 323 701 1356 | Email: contacto@pcortes.com'],
    [],
    ['Fecha del Reporte:', fecha],
    ['Fecha de Generación:', new Date().toLocaleString('es-CO')],
    [],
    ['RESUMEN FINANCIERO DEL DÍA'],
    ['Total de Operaciones:', reporteData.total_ventas || 0],
    ['Total Recaudado ($ COP):', reporteData.total_recaudado || 0],
    ['Total Descuentos ($ COP):', reporteData.total_descuentos || 0],
    ['Total Impuestos ($ COP):', reporteData.total_impuestos || 0],
    ['Total Productos Comercializados:', reporteData.total_productos_vendidos || 0],
    ['Total Servicios Realizados:', reporteData.total_servicios_vendidos || 0],
    [],
    ['DETALLE DE VENTAS REGISTRADAS'],
  ];

  // 2. Encabezados de la tabla
  const tableHeaders = [
    'N° Factura',
    'Fecha / Hora',
    'Tipo Doc',
    'N° Documento',
    'Cliente',
    'Email',
    'Teléfono',
    'Ítems Comercializados (Productos/Servicios)',
    'Método de Pago',
    'Estado',
    'Subtotal ($ COP)',
    'Descuento ($ COP)',
    'Impuestos ($ COP)',
    'Total Venta ($ COP)',
  ];

  // 3. Filas de ventas
  const salesRows = (reporteData.ventas || []).map((v) => {
    const fechaHoraStr = v.fecha_hora ? new Date(v.fecha_hora).toLocaleString('es-CO') : '';
    const cliente = v.cliente || {};
    const itemsStr = (v.detalles || []).map((d) => `${d.nombre_item} [${d.tipo_item}] (x${d.cantidad})`).join('; ');

    return [
      v.numero_factura,
      fechaHoraStr,
      cliente.tipo_documento || 'CC',
      cliente.numero_documento || 'N/A',
      `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim() || 'Cliente General',
      cliente.email || 'N/A',
      cliente.telefono || 'N/A',
      itemsStr || 'Sin ítems',
      v.metodo_pago || 'Efectivo',
      v.estado || 'Completada',
      Number(v.subtotal || 0),
      Number(v.descuento || 0),
      Number(v.impuesto || 0),
      Number(v.total || 0),
    ];
  });

  // Fila de Total General al final
  const totalRow = [
    'TOTAL GENERAL',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    salesRows.reduce((acc, r) => acc + (Number(r[10]) || 0), 0),
    salesRows.reduce((acc, r) => acc + (Number(r[11]) || 0), 0),
    salesRows.reduce((acc, r) => acc + (Number(r[12]) || 0), 0),
    Number(reporteData.total_recaudado || 0),
  ];

  // Combinar todo en una matriz 2D
  const sheetData = [
    ...headerData,
    tableHeaders,
    ...salesRows,
    [],
    totalRow,
  ];

  // Crear la hoja de cálculo
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Configurar anchos de columna automáticos
  ws['!cols'] = [
    { wch: 22 }, // N° Factura
    { wch: 20 }, // Fecha / Hora
    { wch: 10 }, // Tipo Doc
    { wch: 16 }, // N° Documento
    { wch: 26 }, // Cliente
    { wch: 26 }, // Email
    { wch: 14 }, // Teléfono
    { wch: 45 }, // Ítems
    { wch: 16 }, // Método Pago
    { wch: 14 }, // Estado
    { wch: 18 }, // Subtotal
    { wch: 18 }, // Descuento
    { wch: 18 }, // Impuestos
    { wch: 20 }, // Total Venta
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Ventas_${fecha}`);
  XLSX.writeFile(wb, `Reporte_Ventas_PCortes_${fecha}.xlsx`);
}

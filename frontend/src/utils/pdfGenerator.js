import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera y descarga la Factura de Venta en formato PDF
 */
export function generarFacturaPDF(venta) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado Corporativo
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(56, 189, 248); // sky-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PCORTES', 14, 18);

  doc.setTextColor(241, 245, 249); // slate-100
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Soluciones Tecnologicas & Ensamble de Alto Rendimiento', 14, 25);
  doc.text('NIT: 901.458.789-2 | Tel: (57) 323 701 1356 | Email: contacto@pcortes.com', 14, 31);
  doc.text('Direccion: Calle 100 # 15-20, Bogota D.C., Colombia', 14, 37);

  // Recuadro de Factura (lado derecho)
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(pageWidth - 75, 8, 65, 28, 3, 3, 'F');
  
  doc.setTextColor(251, 191, 36); // amber-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FACTURA DE VENTA', pageWidth - 42.5, 15, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(venta.numero_factura || 'FAC-0000', pageWidth - 42.5, 23, { align: 'center' });

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const fechaVenta = venta.fecha_hora ? new Date(venta.fecha_hora).toLocaleString('es-CO') : new Date().toLocaleString('es-CO');
  doc.text(fechaVenta, pageWidth - 42.5, 30, { align: 'center' });

  // Sección de Datos del Cliente y Venta
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DATOS DEL CLIENTE', 14, 52);
  doc.line(14, 54, pageWidth - 14, 54);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const cliente = venta.cliente || {};
  doc.text(`Nombre / Razon Social: ${cliente.nombres || ''} ${cliente.apellidos || ''}`, 14, 61);
  doc.text(`Identificacion: ${cliente.tipo_documento || 'CC'}: ${cliente.numero_documento || 'No registrado'}`, 14, 67);
  doc.text(`Telefono: ${cliente.telefono || 'No registrado'}`, 14, 73);
  doc.text(`Direccion: ${cliente.direccion || 'No registrada'}`, 14, 79);
  doc.text(`Correo Electronico: ${cliente.email || ''}`, 14, 85);

  // Información de la Operación
  doc.text(`Metodo de Pago: ${venta.metodo_pago || 'Efectivo'}`, pageWidth - 80, 61);
  doc.text(`Estado de Factura: ${venta.estado || 'Completada'}`, pageWidth - 80, 67);
  if (venta.usuario_operador) {
    doc.text(`Atendido por: ${venta.usuario_operador.nombres} ${venta.usuario_operador.apellidos}`, pageWidth - 80, 73);
  }

  // Tabla de Detalles de Productos y Servicios
  const tableRows = (venta.detalles || []).map((d, index) => [
    index + 1,
    d.tipo_item === 'producto' ? 'Producto' : 'Servicio',
    d.nombre_item,
    d.cantidad,
    `$${Number(d.precio_unitario).toLocaleString('es-CO')}`,
    `$${Number(d.subtotal).toLocaleString('es-CO')}`,
  ]);

  autoTable(doc, {
    startY: 92,
    head: [['#', 'Tipo', 'Descripcion del Item', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 32, halign: 'right' },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Cuadro de Totales
  const totalesX = pageWidth - 85;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalesX, finalY, 71, 36, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', totalesX + 4, finalY + 8);
  doc.text(`$${Number(venta.subtotal || 0).toLocaleString('es-CO')}`, pageWidth - 18, finalY + 8, { align: 'right' });

  doc.text('Descuento:', totalesX + 4, finalY + 15);
  doc.text(`-$${Number(venta.descuento || 0).toLocaleString('es-CO')}`, pageWidth - 18, finalY + 15, { align: 'right' });

  doc.text('Impuestos (IVA):', totalesX + 4, finalY + 22);
  doc.text(`+$${Number(venta.impuesto || 0).toLocaleString('es-CO')}`, pageWidth - 18, finalY + 22, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL A PAGAR:', totalesX + 4, finalY + 31);
  doc.setTextColor(2, 132, 199); // sky-600
  doc.text(`$${Number(venta.total || 0).toLocaleString('es-CO')}`, pageWidth - 18, finalY + 31, { align: 'right' });

  // Notas al pie
  const pieY = finalY + 46;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Garantia de 1 anio en componentes de hardware y 30 dias en servicios tecnicos.', 14, pieY);
  doc.text('Esta factura electronica representa un comprobante oficial de venta emitido por PCortes.', 14, pieY + 5);

  doc.save(`Factura_${venta.numero_factura || 'PCortes'}.pdf`);
}

/**
 * Genera y descarga el Reporte Diario de Ventas en formato PDF
 */
export function generarReporteDiarioPDF(reporteData, fecha) {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PCORTES -- REPORTE DIARIO DE VENTAS', 14, 16);

  doc.setTextColor(241, 245, 249);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha del Reporte: ${fecha} | Generado el: ${new Date().toLocaleString('es-CO')}`, 14, 25);
  doc.text(`Empresa: PCortes Soluciones Tecnologicas (NIT 901.458.789-2)`, 14, 30);

  // Cuadros de Resumen de KPIs
  const kpiWidth = 48;
  const kpis = [
    { label: 'Total Ventas', val: `${reporteData.total_ventas || 0}` },
    { label: 'Total Recaudado', val: `$${Number(reporteData.total_recaudado || 0).toLocaleString('es-CO')}` },
    { label: 'Productos Vendidos', val: `${reporteData.total_productos_vendidos || 0} unid.` },
    { label: 'Servicios Realizados', val: `${reporteData.total_servicios_vendidos || 0}` },
    { label: 'Total Descuentos', val: `$${Number(reporteData.total_descuentos || 0).toLocaleString('es-CO')}` },
  ];

  let kpiX = 14;
  kpis.forEach((kpi) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(kpiX, 42, kpiWidth, 18, 2, 2, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.label.toUpperCase(), kpiX + 4, 48);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.text(kpi.val, kpiX + 4, 56);
    kpiX += kpiWidth + 7;
  });

  // Filas de la tabla de ventas
  const tableRows = (reporteData.ventas || []).map((v) => {
    const hora = v.fecha_hora ? new Date(v.fecha_hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '--';
    const clienteStr = v.cliente ? `${v.cliente.nombres} ${v.cliente.apellidos}` : 'Cliente General';
    const itemsStr = (v.detalles || []).map((d) => `${d.nombre_item} (x${d.cantidad})`).join(', ');
    return [
      v.numero_factura,
      hora,
      clienteStr,
      itemsStr || 'Sin items',
      v.metodo_pago,
      v.estado,
      `$${Number(v.total).toLocaleString('es-CO')}`,
    ];
  });

  autoTable(doc, {
    startY: 66,
    head: [['N° Factura', 'Hora', 'Cliente', 'Productos / Servicios Comercializados', 'Metodo Pago', 'Estado', 'Total ($ COP)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 44 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 24, halign: 'center' },
      6: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    foot: [[
      'TOTAL GENERAL DEL DIA',
      '',
      '',
      '',
      '',
      '',
      `$${Number(reporteData.total_recaudado || 0).toLocaleString('es-CO')}`,
    ]],
    footStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
  });

  doc.save(`Reporte_Ventas_PCortes_${fecha}.pdf`);
}

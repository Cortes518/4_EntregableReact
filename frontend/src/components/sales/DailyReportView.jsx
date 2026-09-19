import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { saleService } from '../../services/saleService';
import { generarReporteDiarioPDF } from '../../utils/pdfGenerator';
import { generarReporteDiarioExcel } from '../../utils/excelGenerator';
import InvoiceModal from './InvoiceModal';

export default function DailyReportView() {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(getTodayStr());
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  const cargarReporte = async (fechaConsulta) => {
    try {
      setCargando(true);
      setError('');
      const data = await saleService.getDailyReport(fechaConsulta);
      setReporte(data);
    } catch (err) {
      setError(err.message || err.data?.detail || err.response?.data?.detail || 'Error al obtener el reporte diario.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte(fecha);
  }, [fecha]);

  const handleCambiarAyer = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setFecha(d.toISOString().split('T')[0]);
  };

  const handleCambiarHoy = () => {
    setFecha(getTodayStr());
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtro de Fecha y Botones de Exportación */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white font-mono text-sm py-2"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCambiarHoy}
            className={`text-xs py-2 px-3 border ${fecha === getTodayStr() ? 'border-sky-500 text-sky-400 bg-sky-500/10' : 'border-slate-700 text-slate-300'}`}
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCambiarAyer}
            className="text-xs py-2 px-3 border border-slate-700 text-slate-300 hover:text-white"
          >
            Ayer
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => cargarReporte(fecha)}
            className="text-xs py-2 px-3 text-slate-400 hover:text-white"
            title="Refrescar"
          >
            🔄 Actualizar
          </Button>
        </div>

        {/* Acciones de Exportación */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => reporte && generarReporteDiarioPDF(reporte, fecha)}
            disabled={!reporte || cargando}
            className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs py-2.5 px-4 font-semibold rounded-xl"
          >
            <span>📄 Exportar PDF</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => reporte && generarReporteDiarioExcel(reporte, fecha)}
            disabled={!reporte || cargando}
            className="flex items-center gap-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs py-2.5 px-4 font-semibold rounded-xl"
          >
            <span>📊 Exportar Excel</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tarjetas KPI de Resumen */}
      {reporte && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Ventas
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-white font-mono">
                {reporte.total_ventas || 0}
              </span>
              <span className="text-xs text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                Operaciones
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recaudo Total
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-black text-emerald-400 font-mono">
                ${Number(reporte.total_recaudado || 0).toLocaleString('es-CO')}
              </span>
              <span className="text-[10px] text-slate-400">COP</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Productos Vendidos
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-purple-400 font-mono">
                {reporte.total_productos_vendidos || 0}
              </span>
              <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Unidades
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Servicios Prestados
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {reporte.total_servicios_vendidos || 0}
              </span>
              <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Servicios
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Descuentos / Impuestos
            </span>
            <div className="mt-2 text-xs space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Desc:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  -${Number(reporte.total_descuentos || 0).toLocaleString('es-CO')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IVA:</span>
                <span className="font-mono text-slate-200">
                  +${Number(reporte.total_impuestos || 0).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Ventas del Día */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Transacciones del {fecha}
          </h3>
          <span className="text-xs text-slate-400">
            {reporte?.ventas?.length || 0} registros encontrados
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">Generando reporte del día...</p>
          </div>
        ) : !reporte || reporte.ventas?.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <span className="text-3xl block mb-2">🛒</span>
            <p className="font-semibold text-slate-300">No se registraron ventas en esta fecha.</p>
            <p className="text-xs text-slate-500 mt-1">
              Seleccione otra fecha en el calendario superior para consultar otros días.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="py-3 px-4">N° Factura</th>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Ítems</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reporte.ventas.map((v) => {
                  const horaStr = v.fecha_hora
                    ? new Date(v.fecha_hora).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--';
                  const clienteNombre = v.cliente
                    ? `${v.cliente.nombres} ${v.cliente.apellidos}`
                    : 'Cliente General';

                  return (
                    <tr
                      key={v.id_venta}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">
                        {v.numero_factura}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{horaStr}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{clienteNombre}</div>
                        <div className="text-[11px] text-slate-400">
                          {v.cliente?.numero_documento ? `${v.cliente.tipo_documento}: ${v.cliente.numero_documento}` : v.cliente?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">
                          {(v.detalles || []).length} ítem(s)
                        </span>
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                          {(v.detalles || []).map((d) => d.nombre_item).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{v.metodo_pago}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            v.estado === 'Completada'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : v.estado === 'Pendiente'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {v.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                        ${Number(v.total).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setFacturaSeleccionada(v)}
                            className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg"
                          >
                            🧾 Ver
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Factura */}
      {facturaSeleccionada && (
        <InvoiceModal
          abierto={!!facturaSeleccionada}
          venta={facturaSeleccionada}
          onCerrar={() => setFacturaSeleccionada(null)}
        />
      )}
    </div>
  );
}

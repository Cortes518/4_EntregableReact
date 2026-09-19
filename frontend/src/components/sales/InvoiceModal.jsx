import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { generarFacturaPDF } from '../../utils/pdfGenerator';

export default function InvoiceModal({ abierto, venta, onCerrar }) {
  if (!venta) return null;

  const cliente = venta.cliente || {};
  const fechaStr = venta.fecha_hora
    ? new Date(venta.fecha_hora).toLocaleString('es-CO')
    : new Date().toLocaleString('es-CO');

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Factura de Venta Comercial"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-6 text-slate-100">
        {/* Cabecera de la Factura */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80">
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
              PCORTES TECNOLOGÍA
            </span>
            <h3 className="text-xl font-black text-white">{venta.numero_factura}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{fechaStr}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                venta.estado === 'Completada'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : venta.estado === 'Pendiente'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              ● {venta.estado}
            </span>
            <span className="text-xs text-slate-400">Pago: {venta.metodo_pago}</span>
          </div>
        </div>

        {/* Datos del Cliente y Atendido por */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-2">
              Cliente
            </span>
            <p className="font-bold text-white text-sm">
              {cliente.nombres} {cliente.apellidos}
            </p>
            <p className="text-slate-300 mt-0.5">
              {cliente.tipo_documento}: {cliente.numero_documento || 'Sin doc'}
            </p>
            <p className="text-slate-400 mt-0.5">📞 {cliente.telefono || 'Sin teléfono'}</p>
            <p className="text-slate-400 mt-0.5">📍 {cliente.direccion || 'Sin dirección'}</p>
            <p className="text-slate-400 mt-0.5">{cliente.email}</p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-2">
                Emisión
              </span>
              <p className="text-slate-300">
                <strong className="text-white">NIT:</strong> 901.458.789-2
              </p>
              <p className="text-slate-300">
                <strong className="text-white">Sede:</strong> Bogotá D.C.
              </p>
              {venta.usuario_operador && (
                <p className="text-slate-300 mt-1">
                  <strong className="text-white">Operador:</strong> {venta.usuario_operador.nombres} ({venta.usuario_operador.email})
                </p>
              )}
            </div>

            {venta.notas && (
              <p className="text-[11px] text-slate-400 italic bg-slate-800/40 p-2 rounded-lg mt-2 border border-slate-700/40">
                "{venta.notas}"
              </p>
            )}
          </div>
        </div>

        {/* Tabla de Ítems Vendidos */}
        <div className="border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Descripción</th>
                <th className="py-2.5 px-3 text-center">Cant.</th>
                <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {(venta.detalles || []).map((d, index) => (
                <tr key={d.id_detalle || index} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        d.tipo_item === 'producto'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {d.tipo_item === 'producto' ? 'Producto' : 'Servicio'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-white font-medium">{d.nombre_item}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{d.cantidad}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    ${Number(d.precio_unitario).toLocaleString('es-CO')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-400">
                    ${Number(d.subtotal).toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desglose de Totales */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 leading-relaxed max-w-xs text-center sm:text-left">
            Comprobante fiscal digital válido emitido conforme a la normativa comercial de PCortes.
          </div>

          <div className="w-full sm:w-64 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">
                ${Number(venta.subtotal || 0).toLocaleString('es-CO')}
              </span>
            </div>
            {Number(venta.descuento || 0) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Descuento:</span>
                <span className="font-mono">
                  -${Number(venta.descuento).toLocaleString('es-CO')}
                </span>
              </div>
            )}
            {Number(venta.impuesto || 0) > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>IVA (Impuesto):</span>
                <span className="font-mono text-slate-200">
                  +${Number(venta.impuesto).toLocaleString('es-CO')}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
              <span>TOTAL:</span>
              <span className="font-mono text-sky-400">
                ${Number(venta.total || 0).toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onCerrar}>
            Cerrar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => generarFacturaPDF(venta)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/30"
          >
            <span>📄 Descargar Factura en PDF</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

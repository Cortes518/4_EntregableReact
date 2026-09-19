import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { saleService } from '../../services/saleService';

export default function NewSaleModal({
  abierto,
  usuarios = [],
  productos = [],
  servicios = [],
  onCerrar,
  onVentaCreada,
}) {
  const [idCliente, setIdCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [estadoVenta, setEstadoVenta] = useState('Completada');
  const [descuento, setDescuento] = useState(0);
  const [impuesto, setImpuesto] = useState(0);
  const [notas, setNotas] = useState('');

  // Ítems agregados a la venta
  const [items, setItems] = useState([]);

  // Estado del selector de ítem a agregar
  const [tipoItem, setTipoItem] = useState('producto');
  const [selectedId, setSelectedId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Clientes disponibles
  const clientes = usuarios.filter((u) => u.id_rol === 3 || u.rol_nombre === 'Cliente');
  const clientesOptions = (clientes.length > 0 ? clientes : usuarios).map((u) => ({
    value: String(u.id_usuario),
    label: `${u.nombres} ${u.apellidos} (${u.numero_documento || u.email})`,
  }));

  // Actualizar precio y reset al cambiar producto/servicio seleccionado
  useEffect(() => {
    if (tipoItem === 'producto') {
      const prod = productos.find((p) => String(p.id) === String(selectedId));
      if (prod) setPrecioUnitario(prod.precio || 0);
    } else {
      const serv = servicios.find((s) => String(s.id) === String(selectedId));
      if (serv) setPrecioUnitario(serv.precio || 0);
    }
  }, [selectedId, tipoItem, productos, servicios]);

  // Reset del modal al abrir
  useEffect(() => {
    if (abierto) {
      if (clientesOptions.length > 0) setIdCliente(clientesOptions[0].value);
      setMetodoPago('Efectivo');
      setEstadoVenta('Completada');
      setDescuento(0);
      setImpuesto(0);
      setNotas('');
      setItems([]);
      setSelectedId('');
      setCantidad(1);
      setPrecioUnitario(0);
      setError('');
    }
  }, [abierto]);

  // Agregar ítem a la lista
  const handleAgregarItem = () => {
    if (!selectedId) {
      setError('Selecciona un producto o servicio para agregar.');
      return;
    }
    if (Number(cantidad) <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }

    let nombre = '';
    let idProd = null;
    let idServ = null;

    if (tipoItem === 'producto') {
      const prod = productos.find((p) => String(p.id) === String(selectedId));
      if (!prod) return;
      if (prod.stock < Number(cantidad)) {
        setError(`Stock insuficiente para ${prod.nombre}. Solo hay ${prod.stock} disponibles.`);
        return;
      }
      nombre = prod.nombre;
      idProd = prod.id;
    } else {
      const serv = servicios.find((s) => String(s.id) === String(selectedId));
      if (!serv) return;
      nombre = serv.nombre;
      idServ = serv.id;
    }

    const subtotalItem = Number(cantidad) * Number(precioUnitario);
    const nuevoItem = {
      tipo_item: tipoItem,
      id_producto: idProd,
      id_servicio: idServ,
      nombre_item: nombre,
      cantidad: Number(cantidad),
      precio_unitario: Number(precioUnitario),
      subtotal: subtotalItem,
    };

    setItems([...items, nuevoItem]);
    setSelectedId('');
    setCantidad(1);
    setPrecioUnitario(0);
    setError('');
  };

  const handleEliminarItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Cálculos
  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const total = Math.max(0, subtotal - Number(descuento) + Number(impuesto));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idCliente) {
      setError('Debes seleccionar un cliente.');
      return;
    }
    if (items.length === 0) {
      setError('Debes agregar al menos un producto o servicio a la venta.');
      return;
    }

    try {
      setCargando(true);
      setError('');
      const payload = {
        id_cliente: parseInt(idCliente),
        metodo_pago: metodoPago,
        estado: estadoVenta,
        descuento: parseFloat(descuento) || 0,
        impuesto: parseFloat(impuesto) || 0,
        notas: notas || null,
        items: items.map((it) => ({
          tipo_item: it.tipo_item,
          id_producto: it.id_producto,
          id_servicio: it.id_servicio,
          nombre_item: it.nombre_item,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
        })),
      };

      const res = await saleService.createSale(payload);
      if (onVentaCreada) onVentaCreada(res);
      onCerrar();
    } catch (err) {
      setError(err.message || 'Error al procesar la venta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Registrar Nueva Venta (Punto de Venta)"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-slate-100">
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Datos Básicos: Cliente, Método Pago y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
          <div className="sm:col-span-1">
            <Select
              id="idCliente"
              label="Cliente Comprador"
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value)}
              options={clientesOptions}
              required
            />
          </div>

          <div>
            <Select
              id="metodoPago"
              label="Método de Pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              options={[
                { value: 'Efectivo', label: '💵 Efectivo' },
                { value: 'Tarjeta de Débito / Crédito', label: '💳 Tarjeta' },
                { value: 'Transferencia Bancaria', label: '🏦 Transferencia' },
                { value: 'PSE', label: '📱 PSE' },
                { value: 'Contraentrega', label: '📦 Contraentrega' },
              ]}
              required
            />
          </div>

          <div>
            <Select
              id="estadoVenta"
              label="Estado de la Venta"
              value={estadoVenta}
              onChange={(e) => setEstadoVenta(e.target.value)}
              options={[
                { value: 'Completada', label: '✅ Completada' },
                { value: 'Pendiente', label: '⏳ Pendiente' },
                { value: 'Cancelada', label: '❌ Cancelada' },
              ]}
              required
            />
          </div>
        </div>

        {/* Sección para Agregar Productos y Servicios */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
            ➕ Agregar Ítem a la Venta
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">Tipo</label>
              <select
                value={tipoItem}
                onChange={(e) => {
                  setTipoItem(e.target.value);
                  setSelectedId('');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="producto">💻 Producto (PC)</option>
                <option value="servicio">🛠️ Servicio Técnico</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">Seleccionar</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- Seleccionar --</option>
                {tipoItem === 'producto'
                  ? productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (Stock: {p.stock} | ${Number(p.precio).toLocaleString('es-CO')})
                      </option>
                    ))
                  : servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} (${Number(s.precio).toLocaleString('es-CO')})
                      </option>
                    ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <Input
                id="cantidad"
                label="Cant."
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>

            <div className="sm:col-span-3 flex gap-2">
              <div className="flex-1">
                <Input
                  id="precioUnitario"
                  label="Precio ($ COP)"
                  type="number"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleAgregarItem}
                className="h-10 px-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center justify-center"
                title="Agregar ítem"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Ítems Agregados */}
        <div className="border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Descripción</th>
                <th className="py-2.5 px-3 text-center">Cant.</th>
                <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400 italic">
                    No has agregado productos o servicios a la venta aún.
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          it.tipo_item === 'producto'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {it.tipo_item}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">{it.nombre_item}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{it.cantidad}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      ${Number(it.precio_unitario).toLocaleString('es-CO')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-400">
                      ${Number(it.subtotal).toLocaleString('es-CO')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleEliminarItem(idx)}
                        className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                        title="Quitar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Descuentos, Impuestos y Totales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="descuento"
                label="Descuento ($ COP)"
                type="number"
                min="0"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
              <Input
                id="impuesto"
                label="Impuestos / IVA ($ COP)"
                type="number"
                min="0"
                value={impuesto}
                onChange={(e) => setImpuesto(e.target.value)}
              />
            </div>
            <Input
              id="notas"
              label="Notas / Observaciones (Opcional)"
              placeholder="Ej: Entrega a domicilio programada"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">
                ${Number(subtotal).toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Descuento aplicado:</span>
              <span className="font-mono">-${Number(descuento || 0).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Impuestos:</span>
              <span className="font-mono">+${Number(impuesto || 0).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-slate-800">
              <span>TOTAL VENTA:</span>
              <span className="font-mono text-sky-400">${Number(total).toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={cargando} className="bg-emerald-600 hover:bg-emerald-500">
            {cargando ? 'Generando Venta y Factura...' : '💾 Registrar Venta y Generar Factura'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

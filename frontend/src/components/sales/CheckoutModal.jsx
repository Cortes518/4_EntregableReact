import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useAuth } from '../../context/AuthContext';
import { saleService } from '../../services/saleService';

export default function CheckoutModal({
  abierto,
  item,
  tipoItem = 'producto', // 'producto' | 'servicio'
  onCerrar,
  onSuccess,
  onAbrirLogin,
}) {
  const { user, isAuthenticated } = useAuth();

  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState('Transferencia Bancaria');
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (abierto) {
      setCantidad(1);
      setMetodoPago('Transferencia Bancaria');
      setNotas('');
      setError('');
    }
  }, [abierto, item]);

  if (!item) return null;

  const precio = Number(item.precio || 0);
  const stock = tipoItem === 'producto' ? Number(item.stock || 0) : 999;
  const subtotal = Math.round(precio * cantidad * 100) / 100;
  const impuesto = 0; // Se puede calcular si aplica
  const descuento = 0;
  const total = subtotal - descuento + impuesto;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setError('Debes iniciar sesión para realizar la compra.');
      return;
    }

    if (tipoItem === 'producto' && stock <= 0) {
      setError('Este producto no tiene stock disponible.');
      return;
    }

    if (cantidad < 1 || (tipoItem === 'producto' && cantidad > stock)) {
      setError(`La cantidad debe ser entre 1 y ${stock}.`);
      return;
    }

    try {
      setCargando(true);
      setError('');

      const saleData = {
        id_cliente: user.id_usuario,
        id_usuario: null, // Sistema en línea
        metodo_pago: metodoPago,
        estado: 'Completada',
        notas: notas
          ? `Compra Online: ${notas}`
          : `Compra Online desde Catálogo Web`,
        descuento: descuento,
        impuesto: impuesto,
        items: [
          {
            tipo_item: tipoItem,
            id_producto: tipoItem === 'producto' ? item.id : null,
            id_servicio: tipoItem === 'servicio' ? item.id : null,
            nombre_item: item.nombre || item.titulo || 'Ítem de compra',
            cantidad: cantidad,
            precio_unitario: precio,
          },
        ],
      };

      const nuevaVenta = await saleService.createSale(saleData);
      if (onSuccess) {
        onSuccess(nuevaVenta);
      }
      onCerrar();
    } catch (err) {
      const msg = err.message || err.data?.detail || err.response?.data?.detail || 'Error al procesar la compra. Intente nuevamente.';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={tipoItem === 'producto' ? '🛒 Confirmar Compra de Producto' : '🛠️ Solicitar Servicio Técnico'}
      maxWidth="max-w-xl"
    >
      {!isAuthenticated ? (
        <div className="text-center py-6 space-y-4 text-slate-200">
          <div className="w-16 h-16 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-sky-500/20">
            🔒
          </div>
          <h3 className="text-lg font-bold text-white">Inicia Sesión para Comprar</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Para registrar tu orden, generar tu factura electrónica comercial con tus datos y asociarla a tu historial, por favor inicia sesión o crea tu cuenta.
          </p>
          <div className="flex justify-center gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onCerrar();
                if (onAbrirLogin) onAbrirLogin();
              }}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-slate-200">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Tarjeta del Producto/Servicio */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-4">
            {item.imagen ? (
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-20 h-20 object-cover rounded-xl border border-slate-700/60"
              />
            ) : (
              <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center text-3xl border border-slate-700">
                {tipoItem === 'producto' ? '💻' : '🛠️'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                {tipoItem === 'producto' ? (item.categoria || 'Producto') : (item.tipo || 'Servicio Técnico')}
              </span>
              <h4 className="text-base font-bold text-white truncate">{item.nombre}</h4>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.descripcion}</p>
              <div className="text-sm font-black text-emerald-400 mt-1 font-mono">
                ${precio.toLocaleString('es-CO')} COP
              </div>
            </div>
          </div>

          {/* Selector de Cantidad y Método de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cantidad {tipoItem === 'producto' && `(Disponibles: ${stock})`}
              </label>
              <Input
                type="number"
                min="1"
                max={tipoItem === 'producto' ? stock : 50}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={tipoItem === 'producto' && stock <= 0}
                className="font-mono text-center"
              />
              {tipoItem === 'producto' && stock <= 0 && (
                <span className="text-[11px] text-red-400 mt-1 block">Agotado</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Método de Pago
              </label>
              <Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                options={[
                  { value: 'Transferencia Bancaria', label: 'Transferencia (Nequi/Daviplata)' },
                  { value: 'Tarjeta de Crédito / Débito', label: 'Tarjeta de Crédito / Débito' },
                  { value: 'PSE', label: 'PSE (Débito en cuenta)' },
                  { value: 'Efectivo contra entrega', label: 'Efectivo contra entrega' },
                ]}
              />
            </div>
          </div>

          {/* Datos del Comprador */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Datos de Facturación del Comprador
            </span>
            <div className="text-slate-300">
              <strong className="text-white">Nombre:</strong> {user.nombres} {user.apellidos}
            </div>
            <div className="text-slate-300">
              <strong className="text-white">Email:</strong> {user.email}
            </div>
            <div className="text-slate-300">
              <strong className="text-white">Documento:</strong> {user.tipo_documento} {user.numero_documento || 'No registrado'}
            </div>
          </div>

          {/* Notas u Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Dirección de entrega / Notas adicionales
            </label>
            <textarea
              rows="2"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Indica dirección de envío, detalles técnicos o requerimientos especiales..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Resumen de Pago */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal ({cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}):</span>
              <span className="font-mono text-slate-200">${subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
              <span>Total a Pagar:</span>
              <span className="font-mono text-emerald-400">${total.toLocaleString('es-CO')} COP</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onCerrar} disabled={cargando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={cargando || (tipoItem === 'producto' && stock <= 0)}
              className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 font-bold"
            >
              {cargando ? 'Procesando...' : '💳 Confirmar y Generar Factura'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

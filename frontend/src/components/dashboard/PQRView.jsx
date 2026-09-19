import { useState, useEffect } from 'react';
import { pqrService } from '../../services/pqrService';
import PQRFormModal from './PQRFormModal';

const ESTADO_COLORES = {
  'Pendiente': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Recibida': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'En Proceso': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  'Respondida': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Resuelta': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Cerrada': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const TIPO_ICONOS = {
  'Petición': '📋',
  'Queja': '😤',
  'Reclamo': '⚠️',
  'Sugerencia': '💡',
};

export default function PQRView({ rolUsuario = 'admin' }) {
  const [pqrs, setPqrs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalResponder, setModalResponder] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const cargarPQRs = async () => {
    try {
      setCargando(true);
      const data = await pqrService.getAll({
        tipo: filtroTipo || undefined,
        estado: filtroEstado || undefined,
      });
      setPqrs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar PQRs:', err);
      setPqrs([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPQRs();
  }, [filtroTipo, filtroEstado]);

  const handleCrear = async (data) => {
    await pqrService.create(data);
    setModalCrear(false);
    setMensaje('✅ PQR enviada exitosamente.');
    setTimeout(() => setMensaje(''), 3500);
    cargarPQRs();
  };

  const handleResponder = async (data) => {
    await pqrService.update(modalResponder.id_pqr, data);
    setModalResponder(null);
    setMensaje('✅ PQR actualizada exitosamente.');
    setTimeout(() => setMensaje(''), 3500);
    cargarPQRs();
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta PQR?')) return;
    try {
      await pqrService.delete(id);
      setMensaje('✅ PQR eliminada.');
      setTimeout(() => setMensaje(''), 3500);
      cargarPQRs();
    } catch (err) {
      alert(err.message || 'Error al eliminar PQR.');
    }
  };

  // Contadores
  const totalPendientes = pqrs.filter(p => p.estado === 'Pendiente' || p.estado === 'Recibida').length;
  const totalEnProceso = pqrs.filter(p => p.estado === 'En Proceso').length;
  const totalRespondidas = pqrs.filter(p => p.estado === 'Respondida' || p.estado === 'Resuelta').length;

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards de PQR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Total PQR</span>
            <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg text-sm">📩</span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{pqrs.length}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Pendientes</span>
            <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-sm">📋</span>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{totalPendientes}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">En Proceso</span>
            <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg text-sm">⏳</span>
          </div>
          <p className="text-2xl font-black text-sky-400 mt-2">{totalEnProceso}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Respondidas</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm">✅</span>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{totalRespondidas}</p>
        </div>
      </div>

      {/* Barra de Filtros + Acción */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">Todos los tipos</option>
            <option value="Petición">Petición</option>
            <option value="Queja">Queja</option>
            <option value="Reclamo">Reclamo</option>
            <option value="Sugerencia">Sugerencia</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Respondida">Respondida</option>
            <option value="Cerrada">Cerrada</option>
          </select>
        </div>

        {rolUsuario === 'cliente' && (
          <button
            onClick={() => setModalCrear(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            + Nueva PQR
          </button>
        )}
      </div>

      {mensaje && (
        <div className="p-3 bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-semibold">
          {mensaje}
        </div>
      )}

      {/* Tabla de PQRs */}
      {cargando ? (
        <div className="p-12 text-center text-slate-400">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-sm">Cargando PQRs...</p>
        </div>
      ) : pqrs.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-2xl text-center text-slate-400">
          <span className="text-4xl block mb-3">📩</span>
          <p className="text-base font-bold text-slate-300">No hay PQRs registradas</p>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            {rolUsuario === 'cliente'
              ? 'Puedes enviar una petición, queja, reclamo o sugerencia para que nuestro equipo te responda.'
              : 'Aún no se han recibido solicitudes de clientes.'}
          </p>
          {rolUsuario === 'cliente' && (
            <button
              onClick={() => setModalCrear(true)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <span>+</span>
              <span>Radicar Mi Primera PQR</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Asunto</th>
                  {rolUsuario !== 'cliente' && <th className="py-3 px-4">Cliente</th>}
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pqrs.map((pqr) => (
                  <tr key={pqr.id_pqr} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span>{TIPO_ICONOS[pqr.tipo] || '📋'}</span>
                        <span className="font-semibold text-white">{pqr.tipo}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-200 font-medium">{pqr.asunto}</span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[220px]">{pqr.descripcion}</p>
                    </td>
                    {rolUsuario !== 'cliente' && (
                      <td className="py-3 px-4 text-slate-300">{pqr.cliente_nombre}</td>
                    )}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {pqr.fecha_creacion ? new Date(pqr.fecha_creacion).toLocaleDateString('es-CO') : '--'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ESTADO_COLORES[pqr.estado] || 'text-slate-400'}`}>
                        {pqr.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {rolUsuario !== 'cliente' && (
                          <button
                            onClick={() => setModalResponder(pqr)}
                            className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg"
                          >
                            ✏️ Responder
                          </button>
                        )}
                        {rolUsuario === 'admin' && (
                          <button
                            onClick={() => handleEliminar(pqr.id_pqr)}
                            className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 rounded-lg"
                          >
                            🗑️
                          </button>
                        )}
                        {rolUsuario === 'cliente' && pqr.respuesta && (
                          <button
                            onClick={() => setModalResponder(pqr)}
                            className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg"
                          >
                            👁️ Ver Respuesta
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear PQR */}
      {modalCrear && (
        <PQRFormModal
          abierto={modalCrear}
          onCerrar={() => setModalCrear(false)}
          onGuardar={handleCrear}
          modo="crear"
        />
      )}

      {/* Modal Responder/Ver PQR */}
      {modalResponder && (
        <PQRFormModal
          abierto={!!modalResponder}
          onCerrar={() => setModalResponder(null)}
          onGuardar={handleResponder}
          modo="responder"
          datos={modalResponder}
        />
      )}
    </div>
  );
}

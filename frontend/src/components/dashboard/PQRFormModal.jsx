import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const TIPOS_PQR = ['Petición', 'Queja', 'Reclamo', 'Sugerencia'];
const ESTADOS_PQR = ['Pendiente', 'En Proceso', 'Respondida', 'Cerrada'];

export default function PQRFormModal({ abierto, onCerrar, onGuardar, modo = 'crear', datos = null }) {
  const [form, setForm] = useState({
    tipo: datos?.tipo || 'Petición',
    asunto: datos?.asunto || '',
    descripcion: datos?.descripcion || '',
    estado: datos?.estado || 'Pendiente',
    respuesta: datos?.respuesta || '',
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (modo === 'crear') {
      if (!form.asunto.trim() || !form.descripcion.trim()) {
        setError('El asunto y la descripción son obligatorios.');
        return;
      }
    }

    try {
      setCargando(true);
      if (modo === 'crear') {
        await onGuardar({
          tipo: form.tipo,
          asunto: form.asunto.trim(),
          descripcion: form.descripcion.trim(),
        });
      } else {
        // Responder / cambiar estado
        await onGuardar({
          estado: form.estado,
          respuesta: form.respuesta.trim() || undefined,
        });
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la PQR.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={modo === 'crear' ? '📩 Radicar Nueva Solicitud PQR' : '✏️ Responder Solicitud PQR'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1">
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {modo === 'crear' ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Tipo de Solicitud</label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {TIPOS_PQR.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Asunto</label>
              <input
                type="text"
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                placeholder="Describe brevemente tu solicitud..."
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder:text-slate-500"
                maxLength={255}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Detalla tu petición, queja, reclamo o sugerencia..."
                rows={4}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder:text-slate-500 resize-none"
              />
            </div>
          </>
        ) : (
          <>
            {/* Info de la PQR */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 text-xs space-y-2">
              <p><span className="text-slate-400">Tipo:</span> <strong className="text-white">{datos?.tipo}</strong></p>
              <p><span className="text-slate-400">Asunto:</span> <strong className="text-white">{datos?.asunto}</strong></p>
              <p><span className="text-slate-400">Cliente:</span> <strong className="text-white">{datos?.cliente_nombre}</strong></p>
              <p className="text-slate-300 leading-relaxed mt-2 pt-2 border-t border-slate-700">{datos?.descripcion}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Estado</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {ESTADOS_PQR.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Respuesta</label>
              <textarea
                name="respuesta"
                value={form.respuesta}
                onChange={handleChange}
                placeholder="Escribe la respuesta al cliente..."
                rows={4}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder:text-slate-500 resize-none"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" className="text-xs" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="text-xs" disabled={cargando}>
            {cargando ? 'Procesando...' : modo === 'crear' ? 'Enviar PQR' : 'Guardar Respuesta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

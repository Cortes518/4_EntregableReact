import { useState } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ClienteDashboard() {
  const { user, actualizarUsuarioLocal } = useAuth();

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombres: user?.nombres || '',
    apellidos: user?.apellidos || '',
    direccion: user?.direccion || '',
    telefono: user?.telefono || '',
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleActualizarPerfil = async (e) => {
    e.preventDefault();
    try {
      setCargando(true);
      setError('');
      setMensaje('');

      const res = await userService.updateUser(user.id_usuario, form);
      if (res.success) {
        actualizarUsuarioLocal(form);
        setMensaje('¡Tus datos han sido actualizados con éxito en la base de datos!');
        setEditando(false);
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar información.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Cabecera Cliente */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-500/30 uppercase">
                Portal de Clientes
              </span>
              <span className="text-slate-400 text-xs">Rol: Cliente</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Mi Cuenta y Perfil</h1>
            <p className="text-slate-400 text-sm mt-1">
              Hola, <strong className="text-emerald-400">{user?.nombres}</strong>. Gestiona tu información personal y solicitudes técnicas.
            </p>
          </div>

          <button
            onClick={() => setEditando(!editando)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
          >
            {editando ? 'Cancelar Edición' : '✏️ Editar Mis Datos'}
          </button>
        </div>

        {mensaje && (
          <div className="mb-6 p-4 bg-emerald-900/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm flex items-center gap-3">
            <span>✅</span>
            <span>{mensaje}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/60 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center gap-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tarjeta de Información de Perfil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-400 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl mb-4">
              {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-white">{user?.nombres} {user?.apellidos}</h2>
            <p className="text-sm text-slate-400 mb-4">{user?.email}</p>

            <div className="w-full pt-4 border-t border-slate-800 flex flex-col gap-2 text-left text-xs text-slate-300">
              <p><span className="text-slate-500 font-semibold">Tipo Doc:</span> {user?.tipo_documento}</p>
              <p><span className="text-slate-500 font-semibold">N° Doc:</span> {user?.numero_documento}</p>
              <p><span className="text-slate-500 font-semibold">Estado:</span> <span className="text-emerald-400 font-bold">{user?.estado}</span></p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Información de Contacto</h3>

            {editando ? (
              <form onSubmit={handleActualizarPerfil} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input id="nombres" label="Nombres" value={form.nombres} onChange={handleChange} required />
                  <Input id="apellidos" label="Apellidos" value={form.apellidos} onChange={handleChange} required />
                </div>
                <Input id="telefono" label="Teléfono de Contacto" value={form.telefono} onChange={handleChange} required maxLength={10} />
                <Input id="direccion" label="Dirección de Entrega" value={form.direccion} onChange={handleChange} required />

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="ghost" onClick={() => setEditando(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={cargando}>
                    {cargando ? 'Guardando en BD...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Nombre Completo</span>
                  <span className="font-semibold text-white">{user?.nombres} {user?.apellidos}</span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Correo Electrónico</span>
                  <span className="font-semibold text-white">{user?.email}</span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Teléfono Registrado</span>
                  <span className="font-semibold text-white">📞 {user?.telefono || 'No registrado'}</span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Dirección de Entrega</span>
                  <span className="font-semibold text-white">📍 {user?.direccion || 'No registrada'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Soporte y Pedidos */}
        <div className="mt-8 bg-gradient-to-r from-sky-900/40 via-slate-900 to-emerald-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">¿Necesitas soporte técnico o cotizar una PC a medida?</h3>
            <p className="text-slate-300 text-sm">
              Nuestros ingenieros de PCortes están disponibles para brindarte asesoría personalizada en hardware y ensamble.
            </p>
          </div>

          <a
            href="https://wa.me/573000000000?text=Hola%20PCortes,%20soy%20cliente%20y%20deseo%20asesoría%20técnica."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <span>💬 Chatear con Soporte</span>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

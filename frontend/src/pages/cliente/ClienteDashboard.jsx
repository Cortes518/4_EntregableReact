import { useState } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ClienteDashboard() {
  const { user, actualizarUsuarioLocal } = useAuth();
  const [tab, setTab] = useState('perfil'); // 'perfil' | 'seguridad' | 'soporte'

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
      if (res && (res.id_usuario || res.id || res.success)) {
        actualizarUsuarioLocal(res);
        setMensaje('¡Tus datos personales han sido actualizados exitosamente en la base de datos!');
        setEditando(false);
        setTimeout(() => setMensaje(''), 5000);
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

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
        {/* Barra Lateral Minimalista */}
        <Sidebar
          items={[
            { id: 'perfil', label: 'Mi Perfil & Datos', icon: '👤' },
            { id: 'seguridad', label: 'Estado de Cuenta', icon: '🛡️' },
            { id: 'soporte', label: 'Soporte Técnico', icon: '💬' },
          ]}
          activeTab={tab}
          onSelectTab={(newTab) => setTab(newTab)}
          roleTitle="Mi Portal"
          roleBadge="Cliente"
          badgeColor="emerald"
          user={user}
        />

        {/* Área Principal de Contenido */}
        <main className="flex-1 p-4 lg:p-8 min-w-0 flex flex-col gap-6">
          {/* Cabecera minimalista de sección */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl shadow-lg">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {tab === 'perfil' && 'Información de Perfil'}
                {tab === 'seguridad' && 'Estado y Documentación'}
                {tab === 'soporte' && 'Atención y Soporte Técnico'}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                {tab === 'perfil' && 'Actualiza tus nombres, teléfono y dirección de entrega.'}
                {tab === 'seguridad' && 'Detalles de registro y nivel de seguridad de tu cuenta.'}
                {tab === 'soporte' && 'Canales directos de asesoría técnica y cotizaciones de PCs.'}
              </p>
            </div>

            {tab === 'perfil' && (
              <button
                onClick={() => setEditando(!editando)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
              >
                {editando ? '✕ Cancelar Edición' : '✏️ Editar Mis Datos'}
              </button>
            )}
          </div>

          {mensaje && (
            <div className="p-3.5 bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
              <span>✅</span>
              <span>{mensaje}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-900/50 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2.5">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* SECCIÓN 1: MI PERFIL */}
          {tab === 'perfil' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tarjeta de Avatar */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-400 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl mb-3">
                  {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0) || ''}
                </div>
                <h2 className="text-base font-bold text-white">{user?.nombres} {user?.apellidos}</h2>
                <p className="text-xs text-slate-400 mb-4">{user?.email}</p>

                <div className="w-full pt-3 border-t border-slate-800/80 flex flex-col gap-2 text-left text-xs text-slate-300">
                  <p><span className="text-slate-500 font-semibold">Tipo Doc:</span> {user?.tipo_documento || 'CC'}</p>
                  <p><span className="text-slate-500 font-semibold">N° Doc:</span> {user?.numero_documento || 'No registrado'}</p>
                  <p><span className="text-slate-500 font-semibold">Estado:</span> <span className="text-emerald-400 font-bold">{user?.estado || 'Activo'}</span></p>
                </div>
              </div>

              {/* Formulario / Vista de Datos */}
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Datos Personales y Contacto</h3>

                {editando ? (
                  <form onSubmit={handleActualizarPerfil} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input id="nombres" label="Nombres" value={form.nombres} onChange={handleChange} required />
                      <Input id="apellidos" label="Apellidos" value={form.apellidos} onChange={handleChange} required />
                    </div>
                    <Input id="telefono" label="Teléfono de Contacto" value={form.telefono} onChange={handleChange} required maxLength={10} />
                    <Input id="direccion" label="Dirección de Entrega" value={form.direccion} onChange={handleChange} required />

                    <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
                      <Button type="button" variant="ghost" className="text-xs" onClick={() => setEditando(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" variant="primary" className="text-xs" disabled={cargando}>
                        {cargando ? 'Guardando en BD...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block mb-1">Nombre Completo</span>
                      <span className="font-bold text-white text-sm">{user?.nombres} {user?.apellidos}</span>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block mb-1">Correo Electrónico</span>
                      <span className="font-bold text-white text-sm">{user?.email}</span>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block mb-1">Teléfono Registrado</span>
                      <span className="font-bold text-white text-sm">📞 {user?.telefono || 'No registrado'}</span>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block mb-1">Dirección de Entrega</span>
                      <span className="font-bold text-white text-sm">📍 {user?.direccion || 'No registrada'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN 2: ESTADO DE CUENTA & SEGURIDAD */}
          {tab === 'seguridad' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Estado de Autenticación</h3>
                    <p className="text-xs text-slate-400">Protección mediante JWT y contraseña encriptada</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Tipo de Cuenta:</span>
                    <strong className="text-white">Cliente Registrado</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Estado de Membresía:</span>
                    <strong className="text-emerald-400">Activo</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Documento Verificado:</span>
                    <strong className="text-slate-200">{user?.tipo_documento} - {user?.numero_documento}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 text-lg">
                    🔐
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Seguridad de Acceso</h3>
                    <p className="text-xs text-slate-400">Tu contraseña está cifrada con algoritmo Bcrypt</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 pt-2 border-t border-slate-800 leading-relaxed">
                  Si deseas cambiar o restablecer tu contraseña, puedes solicitar un código de seguridad temporal desde la opción de recuperación en el inicio de sesión.
                </p>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: SOPORTE TÉCNICO */}
          {tab === 'soporte' && (
            <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col gap-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">¿Necesitas soporte técnico o cotizar una PC a medida?</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                    Nuestros técnicos de PCortes están disponibles para brindarte asesoría personalizada en hardware, limpieza, ensamble y mantenimiento preventivo.
                  </p>
                </div>

                <a
                  href="https://wa.me/573000000000?text=Hola%20PCortes,%20soy%20cliente%20y%20deseo%20asesoría%20técnica."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <span>💬 Chatear con Soporte</span>
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}


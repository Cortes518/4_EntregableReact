import { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { saleService } from '../../services/saleService';
import { statsService } from '../../services/statsService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import InvoiceModal from '../../components/sales/InvoiceModal';
import PQRView from '../../components/dashboard/PQRView';
import { generarFacturaPDF } from '../../utils/pdfGenerator';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function ClienteDashboard() {
  const { user, actualizarUsuarioLocal } = useAuth();
  const [tab, setTab] = useState('resumen'); // 'resumen' | 'mis_compras' | 'pqr' | 'perfil' | 'seguridad' | 'soporte'

  const [compras, setCompras] = useState([]);
  const [cargandoCompras, setCargandoCompras] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [stats, setStats] = useState(null);
  const [cargandoStats, setCargandoStats] = useState(false);

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

  useEffect(() => {
    // Cargar compras del cliente
    setCargandoCompras(true);
    saleService.getMyPurchases()
      .then((data) => setCompras(Array.isArray(data) ? data : []))
      .catch(() => setCompras([]))
      .finally(() => setCargandoCompras(false));

    // Cargar estadísticas personales del cliente
    setCargandoStats(true);
    statsService.getMyStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Error al cargar stats cliente:', err))
      .finally(() => setCargandoStats(false));
  }, []);

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
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      {/* Barra Lateral Minimalista */}
      <Sidebar
        items={[
          { id: 'resumen', label: 'Mi Resumen', icon: '📊' },
          { id: 'mis_compras', label: 'Mis Compras', icon: '🛒', count: compras.length },
          { id: 'pqr', label: 'Mis PQR', icon: '📩', count: stats?.pqr_pendientes || 0 },
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
              {tab === 'resumen' && 'Resumen de Mi Cuenta'}
              {tab === 'mis_compras' && 'Historial de Compras y Facturas'}
              {tab === 'pqr' && 'Mis Solicitudes PQR'}
              {tab === 'perfil' && 'Información de Perfil'}
              {tab === 'seguridad' && 'Estado y Documentación'}
              {tab === 'soporte' && 'Atención y Soporte Técnico'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {tab === 'resumen' && `Bienvenido, ${user?.nombres}. Aquí puedes ver tu actividad y compras recientes.`}
              {tab === 'mis_compras' && 'Revisa tus pedidos, comprobantes de pago y descarga facturas en PDF.'}
              {tab === 'pqr' && 'Radica peticiones, quejas, reclamos o sugerencias y consulta respuestas.'}
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

          {/* SECCIÓN: MI RESUMEN (DASHBOARD CLIENTE) */}
          {tab === 'resumen' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Tarjetas KPI Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Compras Realizadas</span>
                    <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl text-base">🛒</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-black text-white">{stats?.total_compras ?? compras.length}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Órdenes registradas</p>
                  </div>
                </div>

                <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Gasto Total Acumulado</span>
                    <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-base">💰</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-black text-white">
                      ${Number(stats?.gasto_total ?? 0).toLocaleString('es-CO')}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1">Facturado en compras completadas</p>
                  </div>
                </div>

                <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Mis Solicitudes PQR</span>
                    <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-base">📩</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-3xl font-black text-white">{stats?.mis_pqrs ?? 0}</p>
                    <p className={`text-[11px] font-semibold mt-1 ${(stats?.pqr_pendientes ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {(stats?.pqr_pendientes ?? 0) > 0 ? `⏳ ${stats.pqr_pendientes} en trámite` : '✅ Sin trámites pendientes'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gráfico de Gastos Mensuales */}
              {stats?.gastos_mensuales?.labels?.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <span>📈</span>
                    <span>Historial de Gastos por Mes</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                      data={stats.gastos_mensuales.labels.map((lbl, idx) => ({
                        mes: lbl,
                        total: stats.gastos_mensuales.valores[idx],
                      }))}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                        formatter={(val) => [`$${Number(val).toLocaleString('es-CO')}`, 'Total']}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total Gastado"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Acciones Rápidas del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setTab('mis_compras')}
                  className="flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-2xl transition-all text-left shadow-lg group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl text-lg">🛒</span>
                    <div>
                      <p className="font-bold text-white text-xs">Historial de Compras</p>
                      <p className="text-[11px] text-slate-400">Ver comprobantes y descargar facturas PDF</p>
                    </div>
                  </div>
                  <span className="text-sky-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button
                  onClick={() => setTab('pqr')}
                  className="flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-2xl transition-all text-left shadow-lg group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl text-lg">📩</span>
                    <div>
                      <p className="font-bold text-white text-xs">Radicar o Consultar PQR</p>
                      <p className="text-[11px] text-slate-400">Envía peticiones, reclamos y mira respuestas</p>
                    </div>
                  </div>
                  <span className="text-amber-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN: MIS PQR */}
          {tab === 'pqr' && (
            <PQRView rolUsuario="cliente" />
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

          {/* SECCIÓN: MIS COMPRAS */}
          {tab === 'mis_compras' && (
            <div className="flex flex-col gap-4">
              {cargandoCompras ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
                  <p className="text-sm">Cargando tu historial de compras...</p>
                </div>
              ) : compras.length === 0 ? (
                <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-2xl text-center text-slate-400">
                  <span className="text-4xl block mb-3">🛒</span>
                  <p className="text-base font-bold text-slate-300">Aún no tienes compras registradas</p>
                  <p className="text-xs text-slate-500 mt-1">Explora nuestro catálogo de productos y servicios desde el sitio web.</p>
                </div>
              ) : (
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">📋 Tus Facturas</h3>
                    <span className="text-xs text-slate-400">{compras.length} compra(s)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                          <th className="py-3 px-4">N° Factura</th>
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4">Ítems</th>
                          <th className="py-3 px-4">Método</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-right">Total</th>
                          <th className="py-3 px-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {compras.map((v) => (
                          <tr key={v.id_venta} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-sky-400">{v.numero_factura}</td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {v.fecha_hora ? new Date(v.fecha_hora).toLocaleString('es-CO') : '--'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-300">{(v.detalles || []).length} ítem(s)</span>
                              <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                {(v.detalles || []).map((d) => d.nombre_item).join(', ')}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">{v.metodo_pago}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                v.estado === 'Completada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                v.estado === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}>{v.estado}</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-white">
                              ${Number(v.total).toLocaleString('es-CO')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setFacturaSeleccionada(v)}
                                  className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg"
                                >🧾 Ver</button>
                                <button
                                  onClick={() => generarFacturaPDF(v)}
                                  className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 rounded-lg"
                                >📄 PDF</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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

        {/* Modal Factura */}
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




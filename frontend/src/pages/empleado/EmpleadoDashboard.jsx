import { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { serviceService } from '../../services/serviceService';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { saleService } from '../../services/saleService';
import { userService } from '../../services/userService';
import { statsService } from '../../services/statsService';
import NewSaleModal from '../../components/sales/NewSaleModal';
import InvoiceModal from '../../components/sales/InvoiceModal';
import DailyReportView from '../../components/sales/DailyReportView';
import SalesChartView from '../../components/dashboard/SalesChartView';
import PQRView from '../../components/dashboard/PQRView';
import { generarFacturaPDF } from '../../utils/pdfGenerator';

export default function EmpleadoDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard'); // 'dashboard' | 'ventas' | 'reportes' | 'facturas' | 'productos' | 'servicios'
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [modalProd, setModalProd] = useState({ abierto: false, modo: 'crear', datos: null });
  const [modalServ, setModalServ] = useState({ abierto: false, modo: 'crear', datos: null });
  const [modalVenta, setModalVenta] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [filtrosVentas, setFiltrosVentas] = useState({
    cliente_busqueda: '',
    numero_factura: '',
    estado: '',
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [busquedaFactura, setBusquedaFactura] = useState('');
  const [facturaEncontrada, setFacturaEncontrada] = useState(null);
  const [errorFactura, setErrorFactura] = useState('');
  const [stats, setStats] = useState(null);

  const cargarDatos = async () => {
    try {
      const [p, s, u, v, st] = await Promise.all([
        productService.getAll(true),
        serviceService.getAll(true),
        userService.getAll().catch(() => []),
        saleService.getSales().catch(() => []),
        statsService.getDashboardStats().catch(() => null),
      ]);
      setProductos(Array.isArray(p) ? p : (p?.productos || []));
      setServicios(Array.isArray(s) ? s : (s?.servicios || []));
      setUsuarios(Array.isArray(u) ? u : (u?.usuarios || []));
      setVentas(Array.isArray(v) ? v : []);
      setStats(st);
    } catch (err) {
      alert(err.message || 'Error al cargar catálogo.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const notificar = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 3500);
  };

  const cargarVentas = async (filtros = {}) => {
    try {
      const data = await saleService.getSales(filtros);
      setVentas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    }
  };

  const buscarFactura = async () => {
    if (!busquedaFactura.trim()) return;
    try {
      setErrorFactura('');
      const data = await saleService.getSaleByInvoice(busquedaFactura.trim());
      setFacturaEncontrada(data);
    } catch (err) {
      setErrorFactura('No se encontró la factura.');
      setFacturaEncontrada(null);
    }
  };

  const submitProd = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      if (modalProd.modo === 'crear') await productService.create(data);
      else await productService.update(modalProd.datos.id, data);
      notificar('¡Inventario guardado con éxito!');
      setModalProd({ abierto: false, modo: 'crear', datos: null });
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const submitServ = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      if (modalServ.modo === 'crear') await serviceService.create(data);
      else await serviceService.update(modalServ.datos.id, data);
      notificar('¡Servicio técnico guardado con éxito!');
      setModalServ({ abierto: false, modo: 'crear', datos: null });
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (tipo, id, estadoActual) => {
    try {
      const nuevo = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
      if (tipo === 'prod') await productService.changeStatus(id, nuevo);
      if (tipo === 'serv') await serviceService.changeStatus(id, nuevo);
      notificar(`Estado cambiado a ${nuevo}.`);
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Alertas de stock crítico
  const productosBajoStock = productos.filter((p) => Number(p.stock) <= 5);

  const prodCols = [
    { header: 'ID', accessor: 'id', className: 'font-mono text-xs text-slate-400' },
    {
      header: 'Producto',
      render: (p) => (
        <div>
          <p className="font-bold text-white">{p.nombre}</p>
          <p className="text-xs text-slate-400 truncate max-w-xs">{p.descripcion}</p>
        </div>
      ),
    },
    { header: 'Precio', render: (p) => <span className="font-mono font-bold text-sky-400">${parseFloat(p.precio).toLocaleString('es-CO')}</span> },
    { header: 'Stock', render: (p) => <span className={`px-2 py-0.5 rounded text-xs ${p.stock > 5 ? 'bg-slate-800 text-emerald-400' : 'bg-red-500/20 text-red-300 font-bold'}`}>{p.stock} unid.</span> },
    { header: 'Estado', render: (p) => <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{p.estado}</span> },
    {
      header: 'Acciones',
      className: 'text-center',
      render: (p) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => setModalProd({ abierto: true, modo: 'editar', datos: p })} className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold rounded-lg border border-purple-500/30">✏️ Modificar</button>
          <button onClick={() => toggleStatus('prod', p.id, p.estado)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">{p.estado === 'Activo' ? 'Pausar' : 'Activar'}</button>
        </div>
      ),
    },
  ];

  const servCols = [
    { header: 'ID', accessor: 'id', className: 'font-mono text-xs text-slate-400' },
    {
      header: 'Servicio',
      render: (s) => (
        <div>
          <p className="font-bold text-white">{s.nombre}</p>
          <p className="text-xs text-slate-400 truncate max-w-xs">{s.descripcion}</p>
        </div>
      ),
    },
    { header: 'Precio', render: (s) => <span className="font-mono font-bold text-sky-400">${parseFloat(s.precio).toLocaleString('es-CO')}</span> },
    { header: 'Estado', render: (s) => <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{s.estado}</span> },
    {
      header: 'Acciones',
      className: 'text-center',
      render: (s) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => setModalServ({ abierto: true, modo: 'editar', datos: s })} className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold rounded-lg border border-purple-500/30">✏️ Modificar</button>
          <button onClick={() => toggleStatus('serv', s.id, s.estado)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg">{s.estado === 'Activo' ? 'Pausar' : 'Activar'}</button>
        </div>
      ),
    },
  ];

  const filtrados = (list, keys) =>
    list.filter((item) =>
      keys.some((k) => item[k]?.toString().toLowerCase().includes(busqueda.toLowerCase()))
    );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      {/* Barra Lateral Minimalista */}
      <Sidebar
        items={[
          { id: 'dashboard', label: 'Dashboard Resumen', icon: '📊' },
          { id: 'ventas', label: 'Historial Ventas', icon: '💳', count: ventas.length },
          { id: 'reportes', label: 'Reporte Diario', icon: '📈' },
          { id: 'facturas', label: 'Facturas', icon: '🧾' },
          { id: 'productos', label: 'Inventario PCs', icon: '💻', count: productos.length },
          { id: 'servicios', label: 'Servicios Técnicos', icon: '🛠️', count: servicios.length },
          { id: 'pqr', label: 'Gestión PQR', icon: '📩', count: stats?.pqr_pendientes || 0 },
        ]}
        activeTab={tab}
        onSelectTab={(newTab) => { setTab(newTab); setBusqueda(''); }}
        roleTitle="Panel Operativo"
        roleBadge="Empleado"
        badgeColor="purple"
        user={user}
      />

      {/* Área Principal de Contenido */}
      <main className="flex-1 p-4 lg:p-8 min-w-0 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Cabecera minimalista de sección */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {tab === 'dashboard' && 'Resumen Operativo del Sistema'}
              {tab === 'ventas' && 'Historial de Ventas'}
              {tab === 'reportes' && 'Reporte Diario de Ventas'}
              {tab === 'facturas' && 'Consulta de Facturas'}
              {tab === 'productos' && 'Inventario de Computadores'}
              {tab === 'servicios' && 'Servicios Técnicos Disponibles'}
              {tab === 'pqr' && 'Atención de Solicitudes PQR'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {tab === 'dashboard' && `Bienvenido, ${user?.nombres}. Control operativo y ventas de PCortes.`}
              {tab === 'ventas' && 'Consulta todas las transacciones y descarga facturas.'}
              {tab === 'reportes' && 'Consolidado financiero del día con exportación PDF / Excel.'}
              {tab === 'facturas' && 'Búsqueda directa de facturas comerciales.'}
              {tab === 'productos' && 'Gestiona existencias, precios y disponibilidad de PCs.'}
              {tab === 'servicios' && 'Actualiza tarifas y catálogo de soporte técnico.'}
              {tab === 'pqr' && 'Gestiona y responde las solicitudes radicadas por los clientes.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={cargarDatos} variant="ghost" className="border border-slate-700/80 text-xs py-2 px-3">
              🔄 Refrescar
            </Button>
            {(tab === 'ventas' || tab === 'dashboard') && (
              <Button variant="primary" className="text-xs py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold" onClick={() => setModalVenta(true)}>
                + Nueva Venta
              </Button>
            )}
            {tab === 'productos' && (
              <Button variant="primary" className="text-xs py-2 px-3.5 bg-purple-600 hover:bg-purple-500" onClick={() => setModalProd({ abierto: true, modo: 'crear', datos: null })}>
                + Agregar PC
              </Button>
            )}
            {tab === 'servicios' && (
              <Button variant="primary" className="text-xs py-2 px-3.5 bg-purple-600 hover:bg-purple-500" onClick={() => setModalServ({ abierto: true, modo: 'crear', datos: null })}>
                + Agregar Servicio
              </Button>
            )}
          </div>
        </div>

        {mensaje && (
          <div className="p-3.5 bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
            <span>✅</span>
            <span>{mensaje}</span>
          </div>
        )}

        {/* PESTAÑA 1: DASHBOARD OPERATIVO */}
        {tab === 'dashboard' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Tarjetas de Métricas Operativas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Equipos en Catálogo</span>
                  <span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl text-base">💻</span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-black text-white">{stats?.total_productos ?? productos.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Disponibles para venta</p>
                </div>
              </div>

              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Alertas de Stock Bajo</span>
                  <span className="p-2 bg-red-500/10 text-red-400 rounded-xl text-base">⚠️</span>
                </div>
                <div className="mt-3">
                  <p className={`text-3xl font-black ${(stats?.productos_bajo_stock ?? productosBajoStock.length) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {stats?.productos_bajo_stock ?? productosBajoStock.length}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {(stats?.productos_bajo_stock ?? productosBajoStock.length) > 0 ? 'Productos requieren reabastecimiento' : 'Stock en niveles estables'}
                  </p>
                </div>
              </div>

              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Servicios Técnicos</span>
                  <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl text-base">🛠️</span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-black text-white">{stats?.total_servicios ?? servicios.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Tarifas configuradas</p>
                </div>
              </div>

              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Ventas Realizadas</span>
                  <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-base">💳</span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-black text-white">{stats?.total_ventas ?? ventas.length}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                    ${Number(stats?.total_facturacion ?? 0).toLocaleString('es-CO')} recaudado
                  </p>
                </div>
              </div>
            </div>

            {/* Fila Secundaria: Acciones Rápidas y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Acciones Rápidas */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <span>⚡</span>
                    <span>Acciones Operativas</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setModalProd({ abierto: true, modo: 'crear', datos: null })}
                      className="flex items-center justify-between p-3.5 bg-slate-800/70 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/60 transition-all text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">💻</span>
                        <span>Agregar Nuevo Computador al Catálogo</span>
                      </span>
                      <span className="text-purple-400 font-bold text-sm">+</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalServ({ abierto: true, modo: 'crear', datos: null })}
                      className="flex items-center justify-between p-3.5 bg-slate-800/70 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/60 transition-all text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">🛠️</span>
                        <span>Registrar Nuevo Servicio de Reparación</span>
                      </span>
                      <span className="text-sky-400 font-bold text-sm">+</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Alertas de Stock Crítico */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Productos con Bajo Stock</span>
                </h3>
                {productosBajoStock.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {productosBajoStock.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-red-950/30 border border-red-500/30 rounded-xl text-xs">
                        <div>
                          <p className="font-semibold text-white">{p.nombre}</p>
                          <p className="text-[11px] text-slate-400">${parseFloat(p.precio).toLocaleString('es-CO')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-400 bg-red-500/20 px-2.5 py-0.5 rounded">
                            Stock: {p.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => setModalProd({ abierto: true, modo: 'editar', datos: p })}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded text-xs"
                            title="Modificar Stock"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <p className="text-2xl mb-1">✅</p>
                    <p>No hay productos con inventario crítico.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gráficos de Ventas Operativos */}
            <SalesChartView />
          </div>
        )}

        {/* PESTAÑA: PQR */}
        {tab === 'pqr' && (
          <PQRView rolUsuario="empleado" />
        )}

        {/* PESTAÑA: PRODUCTOS Y SERVICIOS */}
        {['productos', 'servicios'].includes(tab) && (
          <>
            {/* Barra de Filtro / Búsqueda */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={`Buscar en ${tab}...`}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-500"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
              </div>
            </div>

            {/* Tablas de Datos */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-1 overflow-hidden shadow-xl">
              {tab === 'productos' && (
                <DataTable columns={prodCols} data={filtrados(productos, ['nombre', 'descripcion'])} keyField="id" />
              )}

              {tab === 'servicios' && (
                <DataTable columns={servCols} data={filtrados(servicios, ['nombre', 'descripcion'])} keyField="id" />
              )}
            </div>
          </>
        )}

        {/* PESTAÑA: HISTORIAL DE VENTAS */}
        {tab === 'ventas' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <Input
                placeholder="Buscar cliente..."
                value={filtrosVentas.cliente_busqueda}
                onChange={(e) => setFiltrosVentas({ ...filtrosVentas, cliente_busqueda: e.target.value })}
                className="text-xs"
              />
              <Input
                placeholder="N° Factura..."
                value={filtrosVentas.numero_factura}
                onChange={(e) => setFiltrosVentas({ ...filtrosVentas, numero_factura: e.target.value })}
                className="text-xs"
              />
              <Select
                value={filtrosVentas.estado}
                onChange={(e) => setFiltrosVentas({ ...filtrosVentas, estado: e.target.value })}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'Completada', label: '✅ Completada' },
                  { value: 'Pendiente', label: '⏳ Pendiente' },
                  { value: 'Cancelada', label: '❌ Cancelada' },
                ]}
              />
              <Input
                type="date"
                value={filtrosVentas.fecha_inicio}
                onChange={(e) => setFiltrosVentas({ ...filtrosVentas, fecha_inicio: e.target.value })}
                className="text-xs font-mono"
              />
              <Button
                variant="primary"
                className="text-xs py-2 bg-purple-600 hover:bg-purple-500"
                onClick={() => cargarVentas(filtrosVentas)}
              >
                🔍 Filtrar
              </Button>
            </div>

            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                      <th className="py-3 px-4">N° Factura</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Ítems</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {ventas.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400">
                          <span className="text-3xl block mb-2">🛒</span>
                          <p className="font-semibold">No hay ventas registradas.</p>
                        </td>
                      </tr>
                    ) : (
                      ventas.map((v) => (
                        <tr key={v.id_venta} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-sky-400">{v.numero_factura}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {v.fecha_hora ? new Date(v.fecha_hora).toLocaleString('es-CO') : '--'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">
                              {v.cliente ? `${v.cliente.nombres} ${v.cliente.apellidos}` : 'N/A'}
                            </div>
                            <div className="text-[11px] text-slate-400">{v.cliente?.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {(v.detalles || []).length} ítem(s)
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
                              <button onClick={() => setFacturaSeleccionada(v)} className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg">🧾 Ver</button>
                              <button onClick={() => generarFacturaPDF(v)} className="text-[11px] py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 rounded-lg">📄 PDF</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: REPORTE DIARIO */}
        {tab === 'reportes' && <DailyReportView />}

        {/* PESTAÑA: CONSULTA DE FACTURAS */}
        {tab === 'facturas' && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Ingrese número de factura (ej: FAC-20260918-0001)"
                  value={busquedaFactura}
                  onChange={(e) => setBusquedaFactura(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarFactura()}
                  className="text-xs font-mono"
                />
              </div>
              <Button variant="primary" className="text-xs py-2.5 px-5 bg-purple-600 hover:bg-purple-500" onClick={buscarFactura}>
                🔍 Buscar Factura
              </Button>
            </div>

            {errorFactura && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center">
                {errorFactura}
              </div>
            )}

            {facturaEncontrada && (
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{facturaEncontrada.numero_factura}</h3>
                    <p className="text-xs text-slate-400">
                      {facturaEncontrada.fecha_hora ? new Date(facturaEncontrada.fecha_hora).toLocaleString('es-CO') : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-xs border border-slate-700" onClick={() => setFacturaSeleccionada(facturaEncontrada)}>🧾 Ver Completa</Button>
                    <Button variant="ghost" className="text-xs border border-red-500/30 text-red-400" onClick={() => generarFacturaPDF(facturaEncontrada)}>📄 PDF</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-800/50 p-3 rounded-xl"><span className="text-slate-400 block">Cliente</span><span className="font-bold text-white">{facturaEncontrada.cliente?.nombres} {facturaEncontrada.cliente?.apellidos}</span></div>
                  <div className="bg-slate-800/50 p-3 rounded-xl"><span className="text-slate-400 block">Estado</span><span className={`font-bold ${facturaEncontrada.estado === 'Completada' ? 'text-emerald-400' : 'text-amber-400'}`}>{facturaEncontrada.estado}</span></div>
                  <div className="bg-slate-800/50 p-3 rounded-xl"><span className="text-slate-400 block">Método</span><span className="font-bold text-white">{facturaEncontrada.metodo_pago}</span></div>
                  <div className="bg-slate-800/50 p-3 rounded-xl"><span className="text-slate-400 block">Total</span><span className="font-bold text-sky-400 font-mono">${Number(facturaEncontrada.total).toLocaleString('es-CO')}</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Nueva Venta */}
      <NewSaleModal
        abierto={modalVenta}
        usuarios={usuarios}
        productos={productos}
        servicios={servicios}
        onCerrar={() => setModalVenta(false)}
        onVentaCreada={(nuevaVenta) => {
          notificar('¡Venta registrada y factura generada!');
          cargarVentas();
          cargarDatos();
          setFacturaSeleccionada(nuevaVenta);
        }}
      />

      {/* Modal Factura */}
      {facturaSeleccionada && (
        <InvoiceModal
          abierto={!!facturaSeleccionada}
          venta={facturaSeleccionada}
          onCerrar={() => setFacturaSeleccionada(null)}
        />
      )}

      {/* Modal Producto */}
      <Modal abierto={modalProd.abierto} onCerrar={() => setModalProd({ abierto: false, modo: 'crear', datos: null })} titulo={modalProd.modo === 'crear' ? 'Nuevo Producto' : 'Modificar Inventario'}>
        <form onSubmit={submitProd} className="flex flex-col gap-4">
          <Input id="nombre" name="nombre" label="Nombre" defaultValue={modalProd.datos?.nombre || ''} required />
          <Input id="precio" name="precio" label="Precio ($ COP)" type="number" defaultValue={modalProd.datos?.precio || ''} required />
          <Input id="stock" name="stock" label="Stock" type="number" defaultValue={modalProd.datos?.stock || 0} required />
          <Select id="estado" name="estado" label="Estado" defaultValue={modalProd.datos?.estado || 'Activo'} options={[{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]} required />
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="ghost" onClick={() => setModalProd({ abierto: false, modo: 'crear', datos: null })}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Servicio */}
      <Modal abierto={modalServ.abierto} onCerrar={() => setModalServ({ abierto: false, modo: 'crear', datos: null })} titulo={modalServ.modo === 'crear' ? 'Nuevo Servicio' : 'Modificar Servicio'}>
        <form onSubmit={submitServ} className="flex flex-col gap-4">
          <Input id="nombre" name="nombre" label="Nombre" defaultValue={modalServ.datos?.nombre || ''} required />
          <Input id="precio" name="precio" label="Precio ($ COP)" type="number" defaultValue={modalServ.datos?.precio || ''} required />
          <Select id="estado" name="estado" label="Estado" defaultValue={modalServ.datos?.estado || 'Activo'} options={[{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]} required />
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="ghost" onClick={() => setModalServ({ abierto: false, modo: 'crear', datos: null })}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


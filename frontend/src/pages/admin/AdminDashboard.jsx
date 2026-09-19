import { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import UserFormModal from '../../components/admin/UserFormModal';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { serviceService } from '../../services/serviceService';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { saleService } from '../../services/saleService';
import { statsService } from '../../services/statsService';
import NewSaleModal from '../../components/sales/NewSaleModal';
import InvoiceModal from '../../components/sales/InvoiceModal';
import DailyReportView from '../../components/sales/DailyReportView';
import SalesChartView from '../../components/dashboard/SalesChartView';
import PQRView from '../../components/dashboard/PQRView';
import { generarFacturaPDF } from '../../utils/pdfGenerator';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard'); // 'dashboard' | 'usuarios' | 'productos' | 'servicios'
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [modalUser, setModalUser] = useState({ abierto: false, modo: 'crear', datos: null });
  const [modalProd, setModalProd] = useState({ abierto: false, modo: 'crear', datos: null });
  const [modalServ, setModalServ] = useState({ abierto: false, modo: 'crear', datos: null });
  const [modalDelete, setModalDelete] = useState({ abierto: false, tipo: '', id: null, nombre: '' });

  // === Ventas ===
  const [ventas, setVentas] = useState([]);
  const [modalVenta, setModalVenta] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [filtrosVentas, setFiltrosVentas] = useState({
    cliente_busqueda: '', numero_factura: '', estado: '', fecha_inicio: '', fecha_fin: '',
  });
  const [busquedaFactura, setBusquedaFactura] = useState('');
  const [facturaEncontrada, setFacturaEncontrada] = useState(null);
  const [errorFactura, setErrorFactura] = useState('');
  const [stats, setStats] = useState(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [u, p, s, v, st] = await Promise.all([
        userService.getAll(),
        productService.getAll(true),
        serviceService.getAll(true),
        saleService.getSales().catch(() => []),
        statsService.getDashboardStats().catch(() => null),
      ]);
      setUsuarios(Array.isArray(u) ? u : (u?.usuarios || []));
      setProductos(Array.isArray(p) ? p : (p?.productos || []));
      setServicios(Array.isArray(s) ? s : (s?.servicios || []));
      setVentas(Array.isArray(v) ? v : []);
      setStats(st);
    } catch (err) {
      alert(err.message || 'Error al cargar datos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const notificar = (msg) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 3500);
  };

  // Manejadores de formulario
  const handleSaveUser = async (formData) => {
    try {
      if (modalUser.modo === 'crear') {
        await userService.create(formData);
      } else {
        const updatePayload = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          tipo_documento: formData.tipo_documento,
          numero_documento: formData.numero_documento,
          direccion: formData.direccion,
          telefono: formData.telefono,
          email: formData.email,
          id_rol: parseInt(formData.id_rol),
          estado: formData.estado,
        };
        if (formData.password && formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }
        await userService.update(modalUser.datos.id_usuario, updatePayload);
      }
      notificar('¡Usuario guardado con éxito!');
      setModalUser({ abierto: false, modo: 'crear', datos: null });
      cargarDatos();
    } catch (err) {
      throw err;
    }
  };

  const submitProd = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      if (modalProd.modo === 'crear') await productService.create(data);
      else await productService.update(modalProd.datos.id, data);
      notificar('¡Producto guardado con éxito!');
      setModalProd({ abierto: false, modo: 'crear', datos: null });
      cargarDatos();
    } catch (err) {
      alert(err.message || 'Error al guardar producto');
    }
  };

  const submitServ = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      if (modalServ.modo === 'crear') await serviceService.create(data);
      else await serviceService.update(modalServ.datos.id, data);
      notificar('¡Servicio guardado con éxito!');
      setModalServ({ abierto: false, modo: 'crear', datos: null });
      cargarDatos();
    } catch (err) {
      alert(err.message || 'Error al guardar servicio');
    }
  };

  const toggleStatus = async (tipo, id, estadoActual) => {
    try {
      const nuevo = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
      if (tipo === 'user') await userService.changeStatus(id, nuevo);
      if (tipo === 'prod') await productService.changeStatus(id, nuevo);
      if (tipo === 'serv') await serviceService.changeStatus(id, nuevo);
      notificar(`Estado cambiado a ${nuevo}.`);
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmarBorrado = async () => {
    const { tipo, id } = modalDelete;
    try {
      if (tipo === 'usuario') await userService.delete(id);
      if (tipo === 'producto') await productService.delete(id);
      if (tipo === 'servicio') await serviceService.delete(id);
      notificar(`Registro eliminado.`);
      setModalDelete({ abierto: false, tipo: '', id: null, nombre: '' });
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  // === Ventas & Facturas ===
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

  // Métricas calculadas para el dashboard
  const adminsCount = usuarios.filter((u) => u.id_rol === 1).length;
  const empleadosCount = usuarios.filter((u) => u.id_rol === 2).length;
  const clientesCount = usuarios.filter((u) => u.id_rol === 3).length;
  const usuariosActivos = usuarios.filter((u) => u.estado === 'Activo').length;
  const productosBajoStock = productos.filter((p) => Number(p.stock) <= 5);

  // Columnas para DataTable
  const userCols = [
    { header: 'ID', accessor: 'id_usuario', className: 'font-mono text-xs text-slate-400' },
    {
      header: 'Usuario',
      render: (u) => (
        <div>
          <p className="font-bold text-white leading-tight">{u.nombres} {u.apellidos}</p>
          <p className="text-xs text-slate-400">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Documento',
      render: (u) => <span className="text-xs font-mono text-slate-300">{u.tipo_documento}: {u.numero_documento}</span>,
    },
    {
      header: 'Contacto',
      render: (u) => (
        <div className="text-xs">
          <p className="text-slate-300">📞 {u.telefono}</p>
          <p className="text-slate-500 truncate max-w-[130px]" title={u.direccion}>📍 {u.direccion}</p>
        </div>
      ),
    },
    {
      header: 'Rol',
      render: (u) => (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
          u.id_rol === 1 ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
          u.id_rol === 2 ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
          'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        }`}>
          {u.rol_nombre || (u.id_rol === 1 ? 'Administrador' : u.id_rol === 2 ? 'Empleado' : 'Cliente')}
        </span>
      ),
    },
    {
      header: 'Estado',
      render: (u) => (
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${u.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {u.estado}
        </span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-center',
      render: (u) => (
        <div className="flex justify-center gap-1">
          <button onClick={() => setModalUser({ abierto: true, modo: 'editar', datos: u })} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-all" title="Editar">✏️</button>
          <button onClick={() => toggleStatus('user', u.id_usuario, u.estado)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-all" title="Cambiar Estado">{u.estado === 'Activo' ? '⏸️' : '▶️'}</button>
          <button onClick={() => setModalDelete({ abierto: true, tipo: 'usuario', id: u.id_usuario, nombre: `${u.nombres} ${u.apellidos}` })} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all" title="Eliminar">🗑️</button>
        </div>
      ),
    },
  ];

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
    { header: 'Stock', render: (p) => <span className={`px-2 py-0.5 rounded text-xs ${p.stock > 5 ? 'bg-slate-800 text-slate-200' : 'bg-red-500/20 text-red-300 font-bold'}`}>{p.stock} unid.</span> },
    { header: 'Estado', render: (p) => <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{p.estado}</span> },
    {
      header: 'Acciones',
      className: 'text-center',
      render: (p) => (
        <div className="flex justify-center gap-1">
          <button onClick={() => setModalProd({ abierto: true, modo: 'editar', datos: p })} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-all" title="Editar">✏️</button>
          <button onClick={() => toggleStatus('prod', p.id, p.estado)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-all" title="Cambiar Estado">{p.estado === 'Activo' ? '⏸️' : '▶️'}</button>
          <button onClick={() => setModalDelete({ abierto: true, tipo: 'producto', id: p.id, nombre: p.nombre })} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all" title="Eliminar">🗑️</button>
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
        <div className="flex justify-center gap-1">
          <button onClick={() => setModalServ({ abierto: true, modo: 'editar', datos: s })} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-all" title="Editar">✏️</button>
          <button onClick={() => toggleStatus('serv', s.id, s.estado)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-all" title="Cambiar Estado">{s.estado === 'Activo' ? '⏸️' : '▶️'}</button>
          <button onClick={() => setModalDelete({ abierto: true, tipo: 'servicio', id: s.id, nombre: s.nombre })} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all" title="Eliminar">🗑️</button>
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
          { id: 'usuarios', label: 'Gestión Usuarios', icon: '👥', count: usuarios.length },
          { id: 'productos', label: 'Catálogo Productos', icon: '💻', count: productos.length },
          { id: 'servicios', label: 'Servicios Técnicos', icon: '🛠️', count: servicios.length },
          { id: 'pqr', label: 'PQR', icon: '📩', count: stats?.pqr_pendientes || 0 },
        ]}
        activeTab={tab}
        onSelectTab={(newTab) => { setTab(newTab); setBusqueda(''); }}
        roleTitle="Panel Administrador"
        roleBadge="Administrador"
        badgeColor="amber"
        user={user}
      />

      {/* Área Principal de Contenido */}
      <main className="flex-1 p-4 lg:p-8 min-w-0 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Cabecera minimalista de sección */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {tab === 'dashboard' && 'Resumen General del Sistema'}
              {tab === 'ventas' && 'Historial de Ventas'}
              {tab === 'reportes' && 'Reporte Diario de Ventas'}
              {tab === 'facturas' && 'Consulta de Facturas'}
              {tab === 'usuarios' && 'Gestión de Usuarios'}
              {tab === 'productos' && 'Inventario de Productos'}
              {tab === 'servicios' && 'Servicios Técnicos'}
              {tab === 'pqr' && 'Gestión de PQR'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {tab === 'dashboard' && `Bienvenido, ${user?.nombres}. Estado general de la plataforma PCortes.`}
              {tab === 'ventas' && 'Consulta todas las transacciones, comprobantes y facturas emitidas.'}
              {tab === 'reportes' && 'Consolidado financiero por fecha, con exportación a PDF y Excel.'}
              {tab === 'facturas' && 'Búsqueda individual de facturas por código correlativo.'}
              {tab === 'usuarios' && 'Administra cuentas, roles y permisos de acceso.'}
              {tab === 'productos' && 'Controla inventario, precios y stock en catálogo.'}
              {tab === 'servicios' && 'Configura tarifas y disponibilidad técnica.'}
              {tab === 'pqr' && 'Gestiona peticiones, quejas, reclamos y sugerencias de clientes.'}
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
            {tab === 'usuarios' && (
              <Button variant="primary" className="text-xs py-2 px-3.5" onClick={() => setModalUser({ abierto: true, modo: 'crear', datos: null })}>
                + Nuevo Usuario
              </Button>
            )}
            {tab === 'productos' && (
              <Button variant="primary" className="text-xs py-2 px-3.5" onClick={() => setModalProd({ abierto: true, modo: 'crear', datos: null })}>
                + Nuevo Producto
              </Button>
            )}
            {tab === 'servicios' && (
              <Button variant="primary" className="text-xs py-2 px-3.5" onClick={() => setModalServ({ abierto: true, modo: 'crear', datos: null })}>
                + Nuevo Servicio
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

        {/* PESTAÑA 1: DASHBOARD / RESUMEN */}
        {tab === 'dashboard' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Tarjetas de Métricas Principales — 6 cards desde API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Usuarios</span>
                  <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl text-base">👥</span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-black text-white">{stats?.total_usuarios ?? usuarios.length}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">● {stats?.usuarios_activos ?? usuariosActivos} activos</p>
                </div>
              </div>

              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Catálogo PCs</span>
                  <span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl text-base">💻</span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-black text-white">{stats?.total_productos ?? productos.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">En catálogo activo</p>
                </div>
              </div>

              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Servicios Técnicos</span>
                  <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-base">🛠️</span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-black text-white">{stats?.total_servicios ?? servicios.length}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Tarifas disponibles</p>
                </div>
              </div>

              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Ventas</span>
                  <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-base">🧾</span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-black text-white">{stats?.total_ventas ?? ventas.length}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">● {stats?.ventas_completadas ?? 0} completadas</p>
                </div>
              </div>

              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Facturación</span>
                  <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl text-base">💰</span>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-white">${Number(stats?.total_facturacion ?? 0).toLocaleString('es-CO')}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Ingresos acumulados</p>
                </div>
              </div>

              <div className="card-hover bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">PQR</span>
                  <span className="p-2 bg-red-500/10 text-red-400 rounded-xl text-base">📩</span>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-black text-white">{stats?.pqr_recibidas ?? 0}</p>
                  <p className={`text-[11px] font-semibold mt-1 ${(stats?.pqr_pendientes ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {(stats?.pqr_pendientes ?? 0) > 0 ? `⏳ ${stats.pqr_pendientes} pendientes` : '✅ Todas gestionadas'}
                  </p>
                </div>
              </div>
            </div>

            {/* Fila Secundaria: Desglose y Accesos Rápidos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Desglose de Usuarios por Rol */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span>📊</span>
                  <span>Distribución de Usuarios</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl">
                    <span className="text-amber-300 font-semibold">Administradores</span>
                    <span className="font-mono font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
                      {adminsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl">
                    <span className="text-purple-300 font-semibold">Empleados</span>
                    <span className="font-mono font-bold text-white bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30">
                      {empleadosCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl">
                    <span className="text-emerald-300 font-semibold">Clientes</span>
                    <span className="font-mono font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      {clientesCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accesos Rápidos de Administración */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <span>⚡</span>
                    <span>Acciones Rápidas</span>
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <button type="button" onClick={() => setModalUser({ abierto: true, modo: 'crear', datos: null })} className="flex items-center justify-between p-3 bg-slate-800/70 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/60 transition-all text-left">
                      <span className="flex items-center gap-2"><span>👥</span><span>Registrar Nuevo Usuario</span></span>
                      <span className="text-sky-400 font-bold">+</span>
                    </button>
                    <button type="button" onClick={() => setModalProd({ abierto: true, modo: 'crear', datos: null })} className="flex items-center justify-between p-3 bg-slate-800/70 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/60 transition-all text-left">
                      <span className="flex items-center gap-2"><span>💻</span><span>Agregar Equipo PC</span></span>
                      <span className="text-purple-400 font-bold">+</span>
                    </button>
                    <button type="button" onClick={() => setModalServ({ abierto: true, modo: 'crear', datos: null })} className="flex items-center justify-between p-3 bg-slate-800/70 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/60 transition-all text-left">
                      <span className="flex items-center gap-2"><span>🛠️</span><span>Crear Servicio Técnico</span></span>
                      <span className="text-emerald-400 font-bold">+</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Alertas de Stock Crítico */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Alertas de Inventario</span>
                </h3>
                {productosBajoStock.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {productosBajoStock.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-red-950/30 border border-red-500/30 rounded-xl text-xs">
                        <span className="font-semibold text-white truncate max-w-[140px]">{p.nombre}</span>
                        <span className="font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">Stock: {p.stock}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <p className="text-2xl mb-1">✅</p>
                    <p>Todos los productos cuentan con existencias suficientes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gráficos de Ventas */}
            <SalesChartView />
          </div>
        )}

        {/* PESTAÑA: PQR */}
        {tab === 'pqr' && (
          <PQRView rolUsuario="admin" />
        )}

        {/* PESTAÑA: USUARIOS, PRODUCTOS, SERVICIOS */}
        {['usuarios', 'productos', 'servicios'].includes(tab) && (
          <>
            {/* Barra de Filtro / Búsqueda */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={`Buscar en ${tab}...`}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder:text-slate-500"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
              </div>
            </div>

            {/* Tablas de Datos */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-1 overflow-hidden shadow-xl">
              {tab === 'usuarios' && (
                <DataTable
                  columns={userCols}
                  data={filtrados(usuarios, ['nombres', 'apellidos', 'email', 'numero_documento'])}
                  keyField="id_usuario"
                />
              )}

              {tab === 'productos' && (
                <DataTable
                  columns={prodCols}
                  data={filtrados(productos, ['nombre', 'descripcion'])}
                  keyField="id"
                />
              )}

              {tab === 'servicios' && (
                <DataTable
                  columns={servCols}
                  data={filtrados(servicios, ['nombre', 'descripcion'])}
                  keyField="id"
                />
              )}
            </div>
          </>
        )}

        {/* PESTAÑA: HISTORIAL DE VENTAS */}
        {tab === 'ventas' && (
          <div className="flex flex-col gap-4">
            {/* Filtros */}
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
                className="text-xs py-2"
                onClick={() => cargarVentas(filtrosVentas)}
              >
                🔍 Filtrar
              </Button>
            </div>

            {/* Tabla de Ventas */}
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
                          <p className="font-semibold">No hay ventas registradas con estos filtros.</p>
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
              <Button variant="primary" className="text-xs py-2.5 px-5" onClick={buscarFactura}>
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
                    <Button variant="ghost" className="text-xs border border-slate-700" onClick={() => setFacturaSeleccionada(facturaEncontrada)}>🧾 Ver Factura Completa</Button>
                    <Button variant="ghost" className="text-xs border border-red-500/30 text-red-400" onClick={() => generarFacturaPDF(facturaEncontrada)}>📄 Descargar PDF</Button>
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

      {/* Modal Usuario con Validación en Tiempo Real */}
      <UserFormModal
        abierto={modalUser.abierto}
        modo={modalUser.modo}
        datos={modalUser.datos}
        onCerrar={() => setModalUser({ abierto: false, modo: 'crear', datos: null })}
        onGuardar={handleSaveUser}
      />

      {/* Modal Producto */}
      <Modal
        abierto={modalProd.abierto}
        onCerrar={() => setModalProd({ abierto: false, modo: 'crear', datos: null })}
        titulo={modalProd.modo === 'crear' ? 'Nuevo Producto' : 'Editar Producto'}
      >
        <form
          key={modalProd.datos ? `edit-p-${modalProd.datos.id}` : 'crear-p'}
          onSubmit={submitProd}
          className="flex flex-col gap-4"
        >
          <Input id="nombre" name="nombre" label="Nombre" defaultValue={modalProd.datos?.nombre || ''} required />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
            <textarea name="descripcion" rows="3" defaultValue={modalProd.datos?.descripcion || ''} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="precio" name="precio" label="Precio ($ COP)" type="number" defaultValue={modalProd.datos?.precio || ''} required />
            <Input id="stock" name="stock" label="Stock" type="number" defaultValue={modalProd.datos?.stock || 0} required />
          </div>
          <Select id="estado" name="estado" label="Estado" defaultValue={modalProd.datos?.estado || 'Activo'} options={[{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]} required />
          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalProd({ abierto: false, modo: 'crear', datos: null })}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Servicio */}
      <Modal
        abierto={modalServ.abierto}
        onCerrar={() => setModalServ({ abierto: false, modo: 'crear', datos: null })}
        titulo={modalServ.modo === 'crear' ? 'Nuevo Servicio' : 'Editar Servicio'}
      >
        <form
          key={modalServ.datos ? `edit-s-${modalServ.datos.id}` : 'crear-s'}
          onSubmit={submitServ}
          className="flex flex-col gap-4"
        >
          <Input id="nombre" name="nombre" label="Nombre del Servicio" defaultValue={modalServ.datos?.nombre || ''} required />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
            <textarea name="descripcion" rows="3" defaultValue={modalServ.datos?.descripcion || ''} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>
          <Input id="precio" name="precio" label="Precio Tarifa ($ COP)" type="number" defaultValue={modalServ.datos?.precio || ''} required />
          <Select id="estado" name="estado" label="Estado" defaultValue={modalServ.datos?.estado || 'Activo'} options={[{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]} required />
          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalServ({ abierto: false, modo: 'crear', datos: null })}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Nueva Venta */}
      <NewSaleModal
        abierto={modalVenta}
        usuarios={usuarios}
        productos={productos}
        servicios={servicios}
        onCerrar={() => setModalVenta(false)}
        onVentaCreada={(nuevaVenta) => {
          notificar('¡Venta registrada y factura generada con éxito!');
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

      {/* Confirmar Eliminación */}
      <ConfirmModal
        abierto={modalDelete.abierto}
        nombreItem={modalDelete.nombre}
        onCerrar={() => setModalDelete({ abierto: false, tipo: '', id: null, nombre: '' })}
        onConfirmar={confirmarBorrado}
      />
    </div>
  );
}


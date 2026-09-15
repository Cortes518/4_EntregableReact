import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
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



export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('usuarios');
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

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [u, p, s] = await Promise.all([
        userService.getAll(),
        productService.getAll(true),
        serviceService.getAll(true),
      ]);
      setUsuarios(Array.isArray(u) ? u : (u?.usuarios || []));
      setProductos(Array.isArray(p) ? p : (p?.productos || []));
      setServicios(Array.isArray(s) ? s : (s?.servicios || []));
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

  // Definición compacta de columnas para DataTable
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
    { header: 'Stock', render: (p) => <span className={`px-2 py-0.5 rounded text-xs ${p.stock > 5 ? 'bg-slate-800 text-slate-200' : 'bg-red-500/20 text-red-300'}`}>{p.stock} unid.</span> },
    { header: 'Estado', render: (p) => <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{p.estado}</span> },
    {
      header: 'Acciones',
      className: 'text-center',
      render: (p) => (
        <div className="flex justify-center gap-1">
          <button onClick={() => setModalProd({ abierto: true, modo: 'editar', datos: p })} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-all">✏️</button>
          <button onClick={() => toggleStatus('prod', p.id, p.estado)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-all">{p.estado === 'Activo' ? '⏸️' : '▶️'}</button>
          <button onClick={() => setModalDelete({ abierto: true, tipo: 'producto', id: p.id, nombre: p.nombre })} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all">🗑️</button>
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
          <button onClick={() => setModalServ({ abierto: true, modo: 'editar', datos: s })} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-all">✏️</button>
          <button onClick={() => toggleStatus('serv', s.id, s.estado)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-all">{s.estado === 'Activo' ? '⏸️' : '▶️'}</button>
          <button onClick={() => setModalDelete({ abierto: true, tipo: 'servicio', id: s.id, nombre: s.nombre })} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all">🗑️</button>
        </div>
      ),
    },
  ];

  const filtrados = (list, keys) =>
    list.filter((item) =>
      keys.some((k) => item[k]?.toString().toLowerCase().includes(busqueda.toLowerCase()))
    );

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
        {/* Barra Lateral Minimalista */}
        <Sidebar
          items={[
            { id: 'usuarios', label: 'Gestión Usuarios', icon: '👥', count: usuarios.length },
            { id: 'productos', label: 'Catálogo Productos', icon: '💻', count: productos.length },
            { id: 'servicios', label: 'Servicios Técnicos', icon: '🛠️', count: servicios.length },
          ]}
          activeTab={tab}
          onSelectTab={(newTab) => { setTab(newTab); setBusqueda(''); }}
          roleTitle="Panel General"
          roleBadge="Administrador"
          badgeColor="amber"
          user={user}
        />

        {/* Área Principal de Contenido */}
        <main className="flex-1 p-4 lg:p-8 min-w-0 flex flex-col gap-6">
          {/* Cabecera minimalista de sección */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl shadow-lg">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {tab === 'usuarios' && 'Gestión de Usuarios'}
                {tab === 'productos' && 'Inventario de Productos'}
                {tab === 'servicios' && 'Servicios Técnicos'}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                {tab === 'usuarios' && 'Administra cuentas, roles y estados de acceso.'}
                {tab === 'productos' && 'Controla precios, stock y visibilidad en catálogo.'}
                {tab === 'servicios' && 'Configura tarifas y disponibilidad de servicios.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={cargarDatos} variant="ghost" className="border border-slate-700/80 text-xs py-2 px-3">
                🔄 Refrescar
              </Button>
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

          {/* Tarjetas de Métricas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className={`p-4 rounded-xl border transition-all ${tab === 'usuarios' ? 'bg-slate-900 border-sky-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
              <span className="text-xs text-slate-400 font-medium">Usuarios Registrados</span>
              <p className="text-2xl font-black text-white mt-0.5">{usuarios.length}</p>
            </div>
            <div className={`p-4 rounded-xl border transition-all ${tab === 'productos' ? 'bg-slate-900 border-sky-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
              <span className="text-xs text-slate-400 font-medium">Productos en Stock</span>
              <p className="text-2xl font-black text-white mt-0.5">{productos.length}</p>
            </div>
            <div className={`p-4 rounded-xl border transition-all ${tab === 'servicios' ? 'bg-slate-900 border-sky-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
              <span className="text-xs text-slate-400 font-medium">Servicios Activos</span>
              <p className="text-2xl font-black text-white mt-0.5">{servicios.length}</p>
            </div>
          </div>

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
        </main>
      </div>


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

      {/* Confirmar Eliminación */}
      <ConfirmModal
        abierto={modalDelete.abierto}
        nombreItem={modalDelete.nombre}
        onCerrar={() => setModalDelete({ abierto: false, tipo: '', id: null, nombre: '' })}
        onConfirmar={confirmarBorrado}
      />

      <Footer />
    </div>
  );
}

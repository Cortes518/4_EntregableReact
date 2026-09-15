import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { serviceService } from '../../services/serviceService';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';


export default function EmpleadoDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [modalProd, setModalProd] = useState({ abierto: false, modo: 'crear', datos: null });
  const [modalServ, setModalServ] = useState({ abierto: false, modo: 'crear', datos: null });

  const cargarDatos = async () => {
    try {
      const [p, s] = await Promise.all([
        productService.getAll(true),
        serviceService.getAll(true),
      ]);
      setProductos(Array.isArray(p) ? p : (p?.productos || []));
      setServicios(Array.isArray(s) ? s : (s?.servicios || []));
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
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
        {/* Barra Lateral Minimalista */}
        <Sidebar
          items={[
            { id: 'productos', label: 'Inventario PCs', icon: '💻', count: productos.length },
            { id: 'servicios', label: 'Servicios Técnicos', icon: '🛠️', count: servicios.length },
          ]}
          activeTab={tab}
          onSelectTab={(newTab) => { setTab(newTab); setBusqueda(''); }}
          roleTitle="Panel Operativo"
          roleBadge="Empleado"
          badgeColor="purple"
          user={user}
        />

        {/* Área Principal de Contenido */}
        <main className="flex-1 p-4 lg:p-8 min-w-0 flex flex-col gap-6">
          {/* Cabecera minimalista de sección */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/90 p-5 rounded-2xl shadow-lg">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {tab === 'productos' && 'Inventario de Computadores'}
                {tab === 'servicios' && 'Servicios Técnicos Disponibles'}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                {tab === 'productos' && 'Gestiona existencias, precios y disponibilidad de PCs.'}
                {tab === 'servicios' && 'Actualiza tarifas y catálogo de soporte técnico.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={cargarDatos} variant="ghost" className="border border-slate-700/80 text-xs py-2 px-3">
                🔄 Refrescar
              </Button>
              {tab === 'productos' ? (
                <Button variant="primary" className="text-xs py-2 px-3.5 bg-purple-600 hover:bg-purple-500" onClick={() => setModalProd({ abierto: true, modo: 'crear', datos: null })}>
                  + Agregar PC
                </Button>
              ) : (
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

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className={`p-4 rounded-xl border transition-all ${tab === 'productos' ? 'bg-slate-900 border-purple-500/40' : 'bg-slate-900/50 border-slate-800'}`}>
              <span className="text-xs text-slate-400 font-medium">Equipos en Catálogo</span>
              <p className="text-2xl font-black text-white mt-0.5">{productos.length}</p>
            </div>
            <div className={`p-4 rounded-xl border transition-all ${tab === 'servicios' ? 'bg-slate-900 border-purple-500/40' : 'bg-slate-900/50 border-slate-800'}`}>
              <span className="text-xs text-slate-400 font-medium">Servicios Registrados</span>
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
        </main>
      </div>


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

      <Footer />
    </div>
  );
}

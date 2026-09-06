import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2.5 py-1 rounded-md border border-purple-500/30 uppercase">Panel Operativo</span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Gestión de Catálogo e Inventario</h1>
            <p className="text-slate-400 text-sm">Bienvenido, <strong className="text-purple-400">{user?.nombres} {user?.apellidos}</strong>.</p>
          </div>
          <Button onClick={cargarDatos} variant="ghost" className="border border-slate-700">🔄 Refrescar</Button>
        </div>

        {mensaje && (
          <div className="mb-6 p-4 bg-emerald-900/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm flex items-center gap-3">
            <span>✅</span>
            <span>{mensaje}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex gap-2">
            {[
              { id: 'productos', label: '💻 Inventario de PCs', count: productos.length },
              { id: 'servicios', label: '🛠️ Servicios Técnicos', count: servicios.length },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setBusqueda(''); }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  tab === t.id ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <span>{t.label}</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs text-sky-300">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder={`Buscar en ${tab}...`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none w-full sm:w-64"
            />
            {tab === 'productos' ? (
              <Button variant="primary" onClick={() => setModalProd({ abierto: true, modo: 'crear', datos: null })}>+ Agregar PC</Button>
            ) : (
              <Button variant="primary" onClick={() => setModalServ({ abierto: true, modo: 'crear', datos: null })}>+ Agregar Servicio</Button>
            )}
          </div>
        </div>

        {tab === 'productos' && (
          <DataTable columns={prodCols} data={filtrados(productos, ['nombre', 'descripcion'])} keyField="id" />
        )}

        {tab === 'servicios' && (
          <DataTable columns={servCols} data={filtrados(servicios, ['nombre', 'descripcion'])} keyField="id" />
        )}
      </main>

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

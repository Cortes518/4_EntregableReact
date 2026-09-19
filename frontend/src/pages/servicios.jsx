import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import { serviceService } from '../services/serviceService';
import CheckoutModal from '../components/sales/CheckoutModal';
import InvoiceModal from '../components/sales/InvoiceModal';

const serviciosEstaticos = [
  {
    id: 1,
    nombre: 'Mantenimiento Preventivo y Limpieza',
    descripcion: 'Limpieza profunda de componentes, cambio de pasta térmica de alto rendimiento y optimización del sistema.',
    precio: 120000,
  },
  {
    id: 2,
    nombre: 'Ensamble y Configuración Personalizada',
    descripcion: 'Armado profesional de PC con gestión de cables oculta, actualización de BIOS y pruebas de estrés térmico.',
    precio: 180000,
  },
  {
    id: 3,
    nombre: 'Instalación y Optimización de Software',
    descripcion: 'Instalación de Sistema Operativo, drivers actualizados, antivirus y suite de productividad.',
    precio: 90000,
  },
  {
    id: 4,
    nombre: 'Diagnóstico y Reparación de Hardware',
    descripcion: 'Revisión exhaustiva con instrumental de diagnóstico para detección de fallas electrónicas.',
    precio: 80000,
  },
];

export default function ServiciosPage() {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [servicioAComprar, setServicioAComprar] = useState(null);
  const [modalCheckout, setModalCheckout] = useState(false);
  const [facturaGenerada, setFacturaGenerada] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setCargando(true);
        const data = await serviceService.getServices(false); // solo activos
        const list = Array.isArray(data) ? data : (data?.servicios || []);
        if (list.length > 0) {
          setServicios(list);
        } else {
          setServicios(serviciosEstaticos);
        }
      } catch (err) {
        console.warn('Usando catálogo estático de servicios por falta de conexión:', err);
        setServicios(serviciosEstaticos);
      } finally {
        setCargando(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 flex flex-col gap-10">
        {/* Encabezado */}
        <section className="text-center">
          <span className="bg-sky-500/10 text-sky-400 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border border-sky-500/20 mb-3 inline-block">
            Soporte Especializado
          </span>
          <h1 className="text-4xl font-bold text-white mb-3">Nuestros Servicios Técnicos</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Ofrecemos servicios profesionales de ensamble, mantenimiento preventivo, optimización y reparación para tu equipo.
          </p>
        </section>

        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Cargando servicios técnicos desde la base de datos...</p>
          </div>
        ) : (
          /* Grid de servicios */
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {servicios.map((serv) => (
              <div
                key={serv.id}
                className="bg-slate-800 border border-slate-700 hover:border-sky-500 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-slate-900 text-sky-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                      Servicio #{serv.id}
                    </span>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold">
                      ✓ Disponible
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">{serv.nombre}</h2>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {serv.descripcion}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Tarifa fija</span>
                    <span className="font-mono text-xl font-extrabold text-sky-400">
                      ${parseFloat(serv.precio).toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setServicioAComprar(serv);
                        setModalCheckout(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      <span>🛠️ Solicitar en Línea</span>
                    </button>

                    <a
                      href={`https://wa.me/573000000000?text=Hola%20PCortes,%20me%20interesa%20agendar%20el%20servicio:%20${encodeURIComponent(serv.nombre)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-700/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1"
                    >
                      <span>💬 WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Modal Checkout Servicio */}
      {modalCheckout && servicioAComprar && (
        <CheckoutModal
          abierto={modalCheckout}
          item={servicioAComprar}
          tipoItem="servicio"
          onCerrar={() => {
            setModalCheckout(false);
            setServicioAComprar(null);
          }}
          onSuccess={(ventaCreada) => {
            setFacturaGenerada(ventaCreada);
          }}
          onAbrirLogin={() => navigate('/login')}
        />
      )}

      {/* Modal Factura Comercial */}
      {facturaGenerada && (
        <InvoiceModal
          abierto={!!facturaGenerada}
          venta={facturaGenerada}
          onCerrar={() => setFacturaGenerada(null)}
        />
      )}

      <Footer />
    </div>
  );
}

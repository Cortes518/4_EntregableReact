import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import Carousel from '../components/carousel';
import { serviceService } from '../services/serviceService';

export default function IndexPage() {
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    async function cargarServicios() {
      try {
        const data = await serviceService.getServices(false);
        if (data.success && data.servicios) {
          setServicios(data.servicios.slice(0, 4));
        }
      } catch (e) {
        console.warn('Servicios no disponibles en inicio:', e);
      }
    }
    cargarServicios();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 flex flex-col gap-14">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Bienvenido a <span className="text-sky-400">PCortes</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6">
            Las mejores PCs de alto rendimiento para gaming, trabajo y soporte técnico especializado.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/productos"
              className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md"
            >
              Ver Productos
            </Link>
            <Link
              to="/servicios"
              className="inline-block bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Ver Servicios Técnicos
            </Link>
          </div>
        </section>

        {/* Carrusel de Productos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">PCs Destacadas</h2>
            <Link to="/productos" className="text-sm text-sky-400 hover:text-sky-300 font-semibold">
              Ver catálogo completo →
            </Link>
          </div>
          <Carousel />
        </section>

        {/* Sección de Servicios Técnicos */}
        <section className="bg-slate-950/60 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="bg-sky-500/10 text-sky-400 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/20 uppercase tracking-wide">
                Soporte Especializado
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Nuestros Servicios Técnicos</h2>
              <p className="text-slate-400 text-sm mt-1">
                Servicios de ingeniería y mantenimiento preventivo con repuestos originales y garantía.
              </p>
            </div>
            <Link
              to="/servicios"
              className="shrink-0 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              Ver todos los servicios
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(servicios.length > 0 ? servicios : [
              { id: 1, nombre: 'Mantenimiento Preventivo', descripcion: 'Limpieza y pasta térmica de alto rendimiento.', precio: 120000 },
              { id: 2, nombre: 'Ensamble de PC', descripcion: 'Gestión de cables oculta y pruebas de estrés.', precio: 180000 },
              { id: 3, nombre: 'Optimización de Software', descripcion: 'Instalación de SO, drivers y antivirus.', precio: 90000 },
              { id: 4, nombre: 'Diagnóstico de Hardware', descripcion: 'Revisión técnica de componentes.', precio: 80000 },
            ]).map((serv) => (
              <div
                key={serv.id}
                className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-5 rounded-2xl transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-white font-bold text-base mb-2">{serv.nombre}</h3>
                  <p className="text-slate-400 text-xs line-clamp-3 mb-4">{serv.descripcion}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-sm font-extrabold text-sky-400">
                    ${parseFloat(serv.precio).toLocaleString('es-CO')}
                  </span>
                  <a
                    href={`https://wa.me/573000000000?text=Hola,%20deseo%20agendar:%20${encodeURIComponent(serv.nombre)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-500/30 transition-all"
                  >
                    💬 Solicitar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cards de características */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { titulo: 'Alto Rendimiento', desc: 'Componentes de última generación ensamblados con precisión para el máximo desempeño.' },
            { titulo: 'Garantía Incluida', desc: 'Todas nuestras PCs incluyen garantía y soporte técnico especializado.' },
            { titulo: 'Envío a Todo el País', desc: 'Despacho seguro y rápido a cualquier ciudad de Colombia.' },
          ].map(({ titulo, desc }) => (
            <div key={titulo} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-sky-500 transition-all">
              <h3 className="text-white font-semibold text-lg mb-2">{titulo}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}

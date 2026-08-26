import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import Carousel from '../components/carousel';

export default function IndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 flex flex-col gap-12">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Bienvenido a <span className="text-sky-400">PCortes</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6">
            Las mejores PCs de alto rendimiento para gaming, trabajo y creación de contenido.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/productos"
              className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Ver Productos
            </Link>
            <Link
              to="/login"
              className="inline-block border border-sky-600 hover:bg-sky-600/20 text-sky-400 font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </section>

        {/* Carrusel */}
        <section>
          <Carousel />
        </section>

        {/* Cards de características */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { titulo: 'Alto Rendimiento', desc: 'Componentes de última generación ensamblados con precisión para el máximo desempeño.' },
            { titulo: 'Garantía Incluida',  desc: 'Todas nuestras PCs incluyen garantía y soporte técnico especializado.' },
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

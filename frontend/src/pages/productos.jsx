import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import { productService } from '../services/productService';
import { productos as productosEstaticos } from '../components/carousel';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setCargando(true);
        const data = await productService.getProducts(false); // solo activos
        if (data.success && data.productos && data.productos.length > 0) {
          setProductos(data.productos);
        } else {
          setProductos(productosEstaticos);
        }
      } catch (err) {
        console.warn('Usando catálogo estático por falta de conexión:', err);
        setProductos(productosEstaticos);
      } finally {
        setCargando(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 flex flex-col gap-8">
        {/* Encabezado */}
        <section className="text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Nuestros Productos y PCs de Alto Rendimiento</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explora nuestra línea de equipos ensamblados para gaming competitivo, renderizado profesional y streaming.
          </p>
        </section>

        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Cargando catálogo desde la base de datos...</p>
          </div>
        ) : (
          /* Grid de productos */
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((prod, index) => {
              const imagenFallback = productosEstaticos[index % productosEstaticos.length]?.src || '';
              return (
                <div
                  key={prod.id}
                  className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-sky-500 hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-xl"
                >
                  {/* Imagen del producto */}
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img
                      src={prod.src || imagenFallback}
                      alt={prod.nombre || prod.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <span className="absolute top-3 left-3 bg-sky-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      #{prod.id}
                    </span>
                    {prod.stock !== undefined && (
                      <span className="absolute top-3 right-3 bg-slate-900/80 border border-slate-700 text-slate-200 text-xs font-semibold px-2 py-1 rounded-md">
                        Stock: {prod.stock}
                      </span>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <h2 className="text-white font-bold text-lg leading-tight">
                      {prod.nombre || prod.titulo}
                    </h2>
                    <p className="text-slate-400 text-sm flex-1">
                      {prod.descripcion}
                    </p>

                    {prod.precio && (
                      <p className="font-mono text-xl font-extrabold text-sky-400">
                        ${parseFloat(prod.precio).toLocaleString('es-CO')} COP
                      </p>
                    )}

                    <a
                      href={`https://wa.me/573000000000?text=Hola,%20deseo%20comprar%20el%20producto:%20${encodeURIComponent(prod.nombre || prod.titulo)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full text-center bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>💬 Comprar por WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

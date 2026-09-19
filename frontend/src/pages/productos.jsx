import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import { productService } from '../services/productService';
import { productos as productosEstaticos } from '../components/carousel';
import CheckoutModal from '../components/sales/CheckoutModal';
import InvoiceModal from '../components/sales/InvoiceModal';

export default function ProductosPage() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [itemAComprar, setItemAComprar] = useState(null);
  const [modalCheckout, setModalCheckout] = useState(false);
  const [facturaGenerada, setFacturaGenerada] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setCargando(true);
        const data = await productService.getProducts(false); // solo activos
        const list = Array.isArray(data) ? data : (data?.productos || []);
        if (list.length > 0) {
          const prodsConImagen = list.map((p, idx) => ({
            ...p,
            nombre: p.nombre || p.titulo,
            titulo: p.nombre || p.titulo,
            precio: Number(p.precio || 0),
            stock: Number(p.stock !== undefined ? p.stock : 0),
            src: p.imagen || p.src || productosEstaticos[idx % productosEstaticos.length]?.src,
          }));
          setProductos(prodsConImagen);
        } else {
          const estaticosConPrecio = productosEstaticos.map((p, idx) => ({
            ...p,
            nombre: p.titulo,
            precio: 3500000 + (idx + 1) * 600000,
            stock: 10,
          }));
          setProductos(estaticosConPrecio);
        }
      } catch (err) {
        console.warn('Usando catálogo con precios por falta de conexión:', err);
        const estaticosConPrecio = productosEstaticos.map((p, idx) => ({
          ...p,
          nombre: p.titulo,
          precio: 3500000 + (idx + 1) * 600000,
          stock: 10,
        }));
        setProductos(estaticosConPrecio);
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
        <section className="text-center animate-blur-in">
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
                  className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-xl card-hover animate-fade-in-up"
                  style={{ animationDelay: `${0.05 + index * 0.07}s`, opacity: 0 }}
                >
                  {/* Imagen del producto */}
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img
                      src={prod.src || imagenFallback}
                      alt={prod.nombre || prod.titulo}
                      className="w-full h-full object-cover img-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <span className="absolute top-3 left-3 bg-sky-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      #{prod.id}
                    </span>
                    <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-md border ${
                      Number(prod.stock) > 0
                        ? 'bg-slate-900/90 border-slate-700 text-emerald-400'
                        : 'bg-red-500/20 border-red-500/40 text-red-400'
                    }`}>
                      {Number(prod.stock) > 0 ? `Stock: ${prod.stock} unid.` : 'Agotado'}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <h2 className="text-white font-bold text-lg leading-tight">
                      {prod.nombre || prod.titulo}
                    </h2>
                    <p className="text-slate-400 text-sm flex-1">
                      {prod.descripcion}
                    </p>

                    <p className="font-mono text-xl font-extrabold text-sky-400">
                      ${Number(prod.precio || 0).toLocaleString('es-CO')} COP
                    </p>

                    <div className="mt-auto flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        disabled={Number(prod.stock || 0) <= 0}
                        onClick={() => {
                          setItemAComprar(prod);
                          setModalCheckout(true);
                        }}
                        className={`w-full text-center text-xs font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                          Number(prod.stock || 0) > 0
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>{Number(prod.stock || 0) > 0 ? '🛒 Comprar en Línea' : '❌ Sin Stock'}</span>
                      </button>

                      <a
                        href={`https://wa.me/573000000000?text=Hola,%20deseo%20comprar%20el%20producto:%20${encodeURIComponent(prod.nombre || prod.titulo)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-slate-700/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <span>💬 Consultar WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {/* Modal de Checkout / Compra directa */}
      {modalCheckout && itemAComprar && (
        <CheckoutModal
          abierto={modalCheckout}
          item={itemAComprar}
          tipoItem="producto"
          onCerrar={() => {
            setModalCheckout(false);
            setItemAComprar(null);
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

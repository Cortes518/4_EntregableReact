import Header from '../components/header';
import Footer from '../components/footer';
import Carousel from '../components/carousel';

export default function ContactoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 flex flex-col gap-10">
        <section className="text-center animate-blur-in">
          <h1 className="text-4xl font-bold text-white mb-3">Contacto</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Ponte en contacto con nosotros. Estamos aquí para responder tus preguntas.
          </p>
        </section>

        <Carousel />

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-section-reveal stagger-1">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h3 className="text-white font-semibold text-lg mb-3">Información de Contacto</h3>
            <p className="text-slate-400 text-sm mb-1"><span className="text-slate-300 font-medium">Correo:</span> contacto@ejemplo.com</p>
            <p className="text-slate-400 text-sm mb-1"><span className="text-slate-300 font-medium">Teléfono:</span> +57 300 123 4567</p>
            <p className="text-slate-400 text-sm"><span className="text-slate-300 font-medium">Ubicación:</span> Colombia</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.18s', opacity: 0 }}>
            <h3 className="text-white font-semibold text-lg mb-3">Horario de Atención</h3>
            <p className="text-slate-400 text-sm mb-1"><span className="text-slate-300 font-medium">Lunes – Viernes:</span> 8:00 AM – 6:00 PM</p>
            <p className="text-slate-400 text-sm"><span className="text-slate-300 font-medium">Sábado:</span> 9:00 AM – 1:00 PM</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

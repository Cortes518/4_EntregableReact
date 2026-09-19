import { useState, useEffect, useCallback, useRef } from 'react';

import imgGaming    from '../assets/images/prod_gaming.jpg';
import imgWork      from '../assets/images/prod_workstation.jpg';
import imgSetup     from '../assets/images/prod_setup.jpg';
import imgMini      from '../assets/images/prod_mini.jpg';
import imgRgbPro    from '../assets/images/prod_rgb_pro.jpg';
import imgAllInOne  from '../assets/images/prod_allinone.jpg';
import imgStreaming  from '../assets/images/prod_streaming.jpg';
import imgI9        from '../assets/images/prod_i9.jpg';
import imgRyzen9    from '../assets/images/prod_ryzen9.jpg';

export const productos = [
  { id: 1,  src: imgGaming,   titulo: 'PC Gamer Ultra RTX 4090',        descripcion: 'La máquina definitiva para gaming 4K con refrigeración líquida y RGB personalizable.' },
  { id: 2,  src: imgWork,     titulo: 'Workstation Pro AMD Threadripper', descripcion: 'Potencia extrema para diseño 3D, renderizado y edición de video profesional.' },
  { id: 3,  src: imgSetup,    titulo: 'Gaming Setup RGB Completo',        descripcion: 'Paquete todo incluido: torre, monitor curvo 240Hz, teclado y mouse mecánico.' },
  { id: 4,  src: imgMini,     titulo: 'Mini PC Gamer Portátil',           descripcion: 'Compacto, silencioso y potente. Perfecto para espacios reducidos sin sacrificar rendimiento.' },
  { id: 5,  src: imgRgbPro,   titulo: 'PC Gamer Series RGB Pro',          descripcion: 'Estética espectacular con GPU RTX 4070 y 32 GB DDR5 para dominar cualquier juego.' },
  { id: 6,  src: imgAllInOne, titulo: 'PC All-in-One Premium',            descripcion: 'Diseño elegante con pantalla integrada 4K. Ideal para oficina y trabajo creativo.' },
  { id: 7,  src: imgStreaming, titulo: 'PC Streaming & Content Creator',  descripcion: 'Optimizada para streaming en vivo con captura, edición y transmisión simultánea.' },
  { id: 8,  src: imgI9,       titulo: 'PC Intel Core i9 Extreme',         descripcion: 'Velocidad sin límites con el procesador más potente de Intel y 64 GB de RAM.' },
  { id: 9,  src: imgRyzen9,   titulo: 'PC Ryzen 9 7950X Edition',         descripcion: '16 núcleos de alto rendimiento para multitarea exigente y cargas de trabajo pesadas.' },
  { id: 10, src: imgMini,     titulo: 'PC Entrada Gamer',                 descripcion: 'La mejor relación calidad-precio para comenzar en el mundo del gaming competitivo.' },
];

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const intervalRef = useRef(null);

  const siguiente = useCallback(() => {
    setIndex((prev) => (prev === productos.length - 1 ? 0 : prev + 1));
  }, []);

  const anterior = useCallback(() => {
    setIndex((prev) => (prev === 0 ? productos.length - 1 : prev - 1));
  }, []);

  // Auto-play con pausa al hacer hover
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) siguiente();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [siguiente]);

  const item = productos[index];

  return (
    <div
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-slate-800"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {/* Imagen con crossfade */}
      <img
        key={index}
        src={item.src}
        alt={item.titulo}
        className="w-full h-72 sm:h-96 object-cover animate-crossfade"
      />

      {/* Overlay con título y descripción */}
      <div key={`txt-${index}`} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent px-6 py-5 animate-crossfade">
        <p className="text-xs text-sky-400 font-semibold mb-1 uppercase tracking-widest">
          {index + 1} / {productos.length}
        </p>
        <h3 className="text-white text-xl font-bold">{item.titulo}</h3>
        <p className="text-slate-300 text-sm mt-1">{item.descripcion}</p>
      </div>

      {/* Botón Anterior */}
      <button
        type="button"
        onClick={anterior}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-all btn-press"
        aria-label="Anterior"
      >
        ‹
      </button>

      {/* Botón Siguiente */}
      <button
        type="button"
        onClick={siguiente}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-all btn-press"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Indicadores */}
      <div className="absolute top-3 right-4 flex gap-1">
        {productos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir a imagen ${i + 1}`}
            className={`rounded-full transition-all ${
              i === index ? 'bg-sky-500 w-5 h-2' : 'bg-white/40 w-2 h-2 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Barra de progreso auto-play */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700/50">
        <div
          key={`progress-${index}`}
          className="h-full bg-sky-500/60 rounded-full"
          style={{
            animation: pausedRef.current ? 'none' : 'progressBar 5s linear forwards',
          }}
        />
      </div>
    </div>
  );
}

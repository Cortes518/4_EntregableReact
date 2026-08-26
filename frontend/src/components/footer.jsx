import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.jpg';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-700 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="PCortes" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-slate-400 text-sm font-semibold">PCortes</span>
        </div>
        <p className="text-slate-500 text-sm">&copy; 2026 PCortes — Venta de PCs de Alto Rendimiento</p>
        <ul className="flex gap-4">
          <li>
            <Link to="/productos" className="text-slate-500 hover:text-sky-400 text-sm transition-colors">
              Productos
            </Link>
          </li>
          <li>
            <Link to="/contacto" className="text-slate-500 hover:text-sky-400 text-sm transition-colors">
              Contacto
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
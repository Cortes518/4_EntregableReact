import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.jpg';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes', label: 'Quiénes Somos' },
  { to: '/productos', label: 'Productos' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, rol, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMenuAbierto(false);
    logout();
    navigate('/');
  };

  // Obtener la ruta del panel según el rol
  const getPanelRoute = () => {
    if (rol === 'Administrador' || user?.id_rol === 1) return '/admin';
    if (rol === 'Empleado' || user?.id_rol === 2) return '/empleado';
    return '/cliente';
  };

  // Color del badge del rol
  const getRoleBadgeColor = () => {
    if (rol === 'Administrador' || user?.id_rol === 1) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (rol === 'Empleado' || user?.id_rol === 2) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
        {/* Logo + Nombre */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <img
            src={logo}
            alt="PCortes logo"
            className="w-10 h-10 rounded-full object-cover border-2 border-sky-500 group-hover:scale-105 transition-transform"
          />
          <span className="text-sky-400 font-extrabold text-xl tracking-wide hidden sm:block">
            PCortes
          </span>
        </Link>

        {/* Links de navegación principales */}
        <ul className="flex gap-1 flex-wrap items-center">
          {links.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sección de autenticación en Navbar con Submenú */}
        <div className="flex items-center gap-3 shrink-0" ref={menuRef}>
          {isAuthenticated && user ? (
            <div className="relative">
              {/* Botón activador del submenú */}
              <button
                type="button"
                onClick={() => setMenuAbierto((prev) => !prev)}
                className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                aria-expanded={menuAbierto}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.nombres?.charAt(0)}{user.apellidos?.charAt(0) || ''}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">
                  {user.nombres}
                </span>
                <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Submenú desplegable */}
              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-scale-in origin-top-right divide-y divide-slate-800">
                  {/* Encabezado del perfil */}
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-white truncate">
                      {user.nombres} {user.apellidos}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                    <div className="mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getRoleBadgeColor()}`}>
                        {rol || (user.id_rol === 1 ? 'Administrador' : user.id_rol === 2 ? 'Empleado' : 'Cliente')}
                      </span>
                    </div>
                  </div>

                  {/* Enlaces de acción */}
                  <div className="py-1">
                    <Link
                      to={getPanelRoute()}
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      <span className="text-sm">⚙️</span>
                      <span>Ir a mi Panel de Control</span>
                    </Link>
                  </div>

                  {/* Cerrar Sesión */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <span className="text-sm">🚪</span>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-sky-500/25"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
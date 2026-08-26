import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.jpg';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes', label: 'Quiénes Somos' },
  { to: '/productos', label: 'Productos' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, rol, logout } = useAuth();

  const handleLogout = () => {
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
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40 shadow-lg">
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

        {/* Sección de autenticación en Navbar */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Saludo y rol */}
              <div className="text-right hidden md:block">
                <p className="text-xs text-slate-400">Bienvenido(a),</p>
                <p className="text-sm font-bold text-white leading-tight truncate max-w-[150px]">
                  {user.nombres}
                </p>
              </div>

              {/* Badge de Rol y botón de acceso al Panel */}
              <Link
                to={getPanelRoute()}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 hover:scale-105 ${getRoleBadgeColor()}`}
              >
                <span>{rol || 'Panel'}</span>
                <span className="text-[10px]">⚙️</span>
              </Link>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                title="Cerrar sesión"
              >
                Cerrar sesión
              </button>
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
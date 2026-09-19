import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.jpg';

export default function Sidebar({
  items = [],
  activeTab,
  onSelectTab,
  roleTitle = 'Panel',
  roleBadge = 'Usuario',
  badgeColor = 'amber', // 'amber' | 'purple' | 'emerald'
  user = null,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getBadgeClasses = () => {
    switch (badgeColor) {
      case 'purple':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'amber':
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
  };

  const getActiveItemClasses = () => {
    switch (badgeColor) {
      case 'purple':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-900/20';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-900/20';
      case 'amber':
      default:
        return 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-900/20';
    }
  };

  return (
    <aside className="w-full lg:w-64 bg-slate-900/95 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 lg:p-5 flex flex-col justify-between shrink-0 transition-all duration-200">
      <div className="flex flex-col gap-6">
        {/* Encabezado del Panel con Logo PCortes */}
        <div className="flex items-center justify-between lg:justify-start gap-3 pb-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logo}
              alt="PCortes Logo"
              className="w-9 h-9 rounded-full object-cover border-2 border-sky-500 group-hover:scale-105 transition-transform shadow-md"
            />
            <div>
              <span className="text-sky-400 font-extrabold text-base tracking-wide leading-none block">
                PCortes
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">
                Sistema de Gestión
              </span>
            </div>
          </Link>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getBadgeClasses()}`}>
            {roleBadge}
          </span>
        </div>

        {/* Título de Sección */}
        <div className="hidden lg:block -mt-2">
          <h2 className="text-sm font-bold text-white tracking-tight">{roleTitle}</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Navegación de módulos</p>
        </div>

        {/* Lista de Navegación por Secciones */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none" aria-label="Navegación del panel">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                type="button"
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap lg:whitespace-normal w-full text-left ${
                  isActive
                    ? `${getActiveItemClasses()} font-bold`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700/80'
                        : 'bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sección Inferior: Ir al Sitio Web + Perfil + Cerrar Sesión */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800 mt-6">
        {/* Botón para volver al sitio web público */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-semibold text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-600/30 border border-sky-500/30 transition-all shadow-sm"
        >
          <span>🌐</span>
          <span>Ir al Sitio Web</span>
        </Link>

        {/* Perfil del Usuario en Desktop */}
        {user && (
          <div className="hidden lg:flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400 shadow-inner shrink-0">
              {user.nombres?.charAt(0)}{user.apellidos?.charAt(0) || ''}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.nombres} {user.apellidos}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Botón Cerrar Sesión */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-semibold text-red-400 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}


import React from 'react';

export default function Sidebar({
  items = [],
  activeTab,
  onSelectTab,
  roleTitle = 'Panel',
  roleBadge = 'Usuario',
  badgeColor = 'amber', // 'amber' | 'purple' | 'emerald'
  user = null,
}) {
  const getBadgeClasses = () => {
    switch (badgeColor) {
      case 'purple':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'amber':
      default:
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
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
    <aside className="w-full lg:w-64 bg-slate-900/90 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-4 lg:p-5 flex flex-col justify-between shrink-0 transition-all duration-200">
      <div className="flex flex-col gap-6">
        {/* Encabezado del Panel */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getBadgeClasses()}`}>
              {roleBadge}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">{roleTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Secciones de gestión</p>
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
                        ? 'bg-slate-800/90 text-white border border-slate-700/80'
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

      {/* Perfil del Usuario en la parte inferior de la barra lateral (Desktop) */}
      {user && (
        <div className="hidden lg:flex items-center gap-3 pt-4 border-t border-slate-800/80 mt-6">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400 shadow-inner shrink-0">
            {user.nombres?.charAt(0)}{user.apellidos?.charAt(0) || ''}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.nombres} {user.apellidos}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

import Button from './Button';

/**
 * Componente modal genérico y reutilizable
 */
export default function Modal({
  abierto,
  isOpen,
  onCerrar,
  onClose,
  titulo,
  title,
  children,
  maxWidth = 'max-w-lg',
}) {
  const visible = abierto ?? isOpen;
  const cerrar = onCerrar ?? onClose;
  const headerTitulo = titulo ?? title;

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 transition-all animate-scale-in`}
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-wide">{headerTitulo}</h2>
          <button
            type="button"
            onClick={cerrar}
            className="text-slate-400 hover:text-white text-2xl leading-none transition-colors p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

import Button from './Button';

/**
 * Componente modal genérico y reutilizable
 */
export default function Modal({
  abierto,
  onCerrar,
  titulo,
  children,
  maxWidth = 'max-w-lg',
}) {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 transition-all`}
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-wide">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-white text-2xl leading-none transition-colors p-1"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

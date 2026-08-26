import Button from './Button';

/**
 * Modal reutilizable de confirmación para eliminaciones
 */
export default function ConfirmModal({
  abierto,
  onCerrar,
  onConfirmar,
  titulo = '¿Confirmas la eliminación?',
  mensaje,
  nombreItem,
  cargando = false,
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 animate-fade-in backdrop-blur-xs">
      <div className="bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <h3 className="text-xl font-bold text-white mb-2">{titulo}</h3>
        <p className="text-slate-300 text-sm mb-6">
          {mensaje || (
            <>
              Estás a punto de eliminar permanentemente: <br />
              <strong className="text-red-400">"{nombreItem}"</strong>. Esta acción no se puede deshacer.
            </>
          )}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="ghost" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/30"
          >
            {cargando ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

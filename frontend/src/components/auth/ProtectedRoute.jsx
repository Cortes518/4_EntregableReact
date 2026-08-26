import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente para proteger rutas privadas según autenticación y roles
 */
export default function ProtectedRoute({ children, rolesPermitidos = [] }) {
  const { user, isAuthenticated, loading, rol } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos.length > 0) {
    const tienePermiso = rolesPermitidos.some(
      (r) => r.toLowerCase() === (rol || '').toLowerCase()
    );

    if (!tienePermiso) {
      // Redirigir según su rol correspondiente
      if (rol === 'Administrador') return <Navigate to="/admin" replace />;
      if (rol === 'Empleado') return <Navigate to="/empleado" replace />;
      return <Navigate to="/cliente" replace />;
    }
  }

  return children;
}

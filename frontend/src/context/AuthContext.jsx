import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializar estado de sesión desde localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('pcortes_token');
      const storedUser = localStorage.getItem('pcortes_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error al restaurar sesión:', e);
      localStorage.removeItem('pcortes_token');
      localStorage.removeItem('pcortes_user');
    } finally {
      setLoading(false);
    }

    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.usuario);
      localStorage.setItem('pcortes_token', data.token);
      localStorage.setItem('pcortes_user', JSON.stringify(data.usuario));
    }
    return data;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pcortes_token');
    localStorage.removeItem('pcortes_user');
  };

  const actualizarUsuarioLocal = (nuevosDatos) => {
    setUser((prev) => {
      const actualizado = { ...prev, ...nuevosDatos };
      localStorage.setItem('pcortes_user', JSON.stringify(actualizado));
      return actualizado;
    });
  };

  const rol = user?.rol_nombre || (user?.id_rol === 1 ? 'Administrador' : user?.id_rol === 2 ? 'Empleado' : 'Cliente');
  const isAdmin = rol === 'Administrador' || user?.id_rol === 1;
  const isEmpleado = rol === 'Empleado' || user?.id_rol === 2;
  const isCliente = rol === 'Cliente' || user?.id_rol === 3;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        rol,
        isAdmin,
        isEmpleado,
        isCliente,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        actualizarUsuarioLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}

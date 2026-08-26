import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WhatsAppButton from './components/ui/WhatsAppButton';

// Páginas públicas
import IndexPage from './pages/index';
import QuienesPage from './pages/quienes';
import ContactoPage from './pages/contacto';
import LoginPage from './pages/login';
import ProductosPage from './pages/productos';
import ServiciosPage from './pages/servicios';

// Paneles por Rol
import AdminDashboard from './pages/admin/AdminDashboard';
import EmpleadoDashboard from './pages/empleado/EmpleadoDashboard';
import ClienteDashboard from './pages/cliente/ClienteDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<IndexPage />} />
          <Route path="/quienes" element={<QuienesPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/servicios" element={<ServiciosPage />} />

          {/* Rutas Protegidas por Rol */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute rolesPermitidos={['Administrador']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empleado"
            element={
              <ProtectedRoute rolesPermitidos={['Empleado', 'Administrador']}>
                <EmpleadoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cliente"
            element={
              <ProtectedRoute rolesPermitidos={['Cliente', 'Empleado', 'Administrador']}>
                <ClienteDashboard />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto para 404 */}
          <Route path="*" element={<IndexPage />} />
        </Routes>

        {/* Componente Flotante Global de WhatsApp */}
        <WhatsAppButton />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

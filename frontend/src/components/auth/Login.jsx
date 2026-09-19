import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RecoverPassword from './RecoverPassword';
import RegisterModal from './RegisterModal';

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [vista, setVista] = useState('login'); // 'login' | 'recover'
  const [modalAbierto, setModalAbierto] = useState(false);

  const [form, setForm] = useState({ email: '', password: '', recordarme: false });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [id]: val }));
    setErrorServidor('');

    // Validación en tiempo real
    if (id === 'email') {
      setErrores((prev) => ({
        ...prev,
        email: !value ? 'El correo es obligatorio.' : !validarEmail(value) ? 'Correo inválido.' : '',
      }));
    }
    if (id === 'password') {
      setErrores((prev) => ({
        ...prev,
        password: !value ? 'La contraseña es obligatoria.' : value.length < 6 ? 'Mínimo 6 caracteres.' : '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = 'El correo es obligatorio.';
    else if (!validarEmail(form.email)) newErrors.email = 'Correo inválido.';
    if (!form.password) newErrors.password = 'La contraseña es obligatoria.';

    setErrores(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setCargando(true);
      setErrorServidor('');
      const data = await login(form.email, form.password);

      const rol = data.usuario.rol_nombre || (data.usuario.id_rol === 1 ? 'Administrador' : data.usuario.id_rol === 2 ? 'Empleado' : 'Cliente');

      if (rol === 'Administrador' || data.usuario.id_rol === 1) {
        navigate('/admin');
      } else if (rol === 'Empleado' || data.usuario.id_rol === 2) {
        navigate('/empleado');
      } else {
        navigate('/cliente');
      }
    } catch (err) {
      setErrorServidor(err.message || 'Error al iniciar sesión. Verifica tus datos.');
    } finally {
      setCargando(false);
    }
  };

  if (vista === 'recover') {
    return <RecoverPassword onVolver={() => setVista('login')} />;
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 animate-scale-in">
          <h1 className="text-2xl font-bold text-white mb-1 animate-blur-in">Iniciar sesión</h1>
          <p className="text-slate-400 text-sm mb-6">Bienvenido de vuelta. Ingresa tus datos para continuar.</p>

          {errorServidor && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorServidor}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="email"
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              error={errores.email}
              required
            />

            <Input
              id="password"
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errores.password}
              required
            />

            <div className="flex items-center gap-2">
              <input
                id="recordarme"
                type="checkbox"
                checked={form.recordarme}
                onChange={handleChange}
                className="w-4 h-4 accent-sky-500 cursor-pointer"
              />
              <label htmlFor="recordarme" className="text-sm text-slate-300 cursor-pointer">
                Recordarme / Mantener sesión
              </label>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={cargando}>
              {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>



          <div className="mt-5 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setVista('recover')}
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>

            <p className="text-sm text-slate-400">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setModalAbierto(true)}
                className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
              >
                Crear una cuenta
              </button>
            </p>
          </div>
        </div>
      </div>

      {modalAbierto && <RegisterModal onCerrar={() => setModalAbierto(false)} />}
    </>
  );
}

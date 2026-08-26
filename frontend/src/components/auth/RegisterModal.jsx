import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const TIPOS_DOC = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telefonoRegex = /^[0-9]{7,10}$/;
const docRegex = /^[0-9]{5,12}$/;
const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/;

function validar(form) {
  const err = {};
  if (!form.nombre.trim()) err.nombre = 'El nombre es obligatorio.';
  else if (!soloLetras.test(form.nombre)) err.nombre = 'Solo se permiten letras.';
  else if (form.nombre.trim().length < 2) err.nombre = 'Mínimo 2 caracteres.';

  if (!form.apellido.trim()) err.apellido = 'El apellido es obligatorio.';
  else if (!soloLetras.test(form.apellido)) err.apellido = 'Solo se permiten letras.';
  else if (form.apellido.trim().length < 2) err.apellido = 'Mínimo 2 caracteres.';

  if (!form.tipoDoc) err.tipoDoc = 'Selecciona un tipo de documento.';

  if (!form.numDoc) err.numDoc = 'El número de documento es obligatorio.';
  else if (!docRegex.test(form.numDoc)) err.numDoc = 'Debe tener entre 5 y 12 dígitos numéricos.';

  if (!form.direccion.trim()) err.direccion = 'La dirección es obligatoria.';
  else if (form.direccion.trim().length < 5) err.direccion = 'Mínimo 5 caracteres.';

  if (!form.telefono) err.telefono = 'El teléfono es obligatorio.';
  else if (!telefonoRegex.test(form.telefono)) err.telefono = 'Debe tener entre 7 y 10 dígitos numéricos.';

  if (!form.email) err.email = 'El correo es obligatorio.';
  else if (!emailRegex.test(form.email)) err.email = 'Formato de correo inválido.';

  if (!form.password) err.password = 'La contraseña es obligatoria.';
  else if (form.password.length < 8) err.password = 'Mínimo 8 caracteres.';

  if (!form.confirmar) err.confirmar = 'Debes confirmar la contraseña.';
  else if (form.password !== form.confirmar) err.confirmar = 'Las contraseñas no coinciden.';

  return err;
}

const VACIO = {
  nombre: '',
  apellido: '',
  tipoDoc: 'CC',
  numDoc: '',
  direccion: '',
  telefono: '',
  email: '',
  password: '',
  confirmar: '',
};

export default function RegisterModal({ onCerrar }) {
  const { register } = useAuth();

  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  // Validar en tiempo real si ya hubo un intento de envío
  useEffect(() => {
    if (Object.keys(errores).length > 0) {
      setErrores(validar(form));
    }
  }, [form]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    // Restricción de caracteres numéricos
    if (['numDoc', 'telefono'].includes(id) && /[^0-9]/.test(value)) return;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrorServidor('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validar(form);
    setErrores(err);
    if (Object.keys(err).length > 0) return;

    try {
      setCargando(true);
      setErrorServidor('');

      const payload = {
        nombres: form.nombre.trim(),
        apellidos: form.apellido.trim(),
        tipo_documento: form.tipoDoc,
        numero_documento: form.numDoc.trim(),
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      await register(payload);
      setRegistrado(true);
    } catch (err) {
      setErrorServidor(err.message || 'Error al procesar el registro en el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-xl font-bold text-white">Crear cuenta de Cliente</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-white text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {errorServidor && (
          <div className="mb-5 p-3 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-start gap-2">
            <span className="font-bold">⚠️</span>
            <span>{errorServidor}</span>
          </div>
        )}

        {registrado ? (
          <div className="text-center py-10">
            <p className="text-5xl mb-3">🎉</p>
            <h3 className="text-emerald-400 text-2xl font-bold mb-2">¡Registro exitoso!</h3>
            <p className="text-slate-300 mb-2">Tu cuenta ha sido creada y almacenada en la base de datos.</p>
            <p className="text-slate-400 text-sm mb-6">Ya puedes iniciar sesión con tu correo y contraseña.</p>
            <Button onClick={onCerrar} variant="primary">Iniciar sesión ahora</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="nombre" label="Nombres" value={form.nombre} onChange={handleChange} error={errores.nombre} required maxLength={50} />
            <Input id="apellido" label="Apellidos" value={form.apellido} onChange={handleChange} error={errores.apellido} required maxLength={50} />

            <Select
              id="tipoDoc"
              label="Tipo de documento"
              value={form.tipoDoc}
              onChange={(e) => setForm((p) => ({ ...p, tipoDoc: e.target.value }))}
              options={TIPOS_DOC}
              error={errores.tipoDoc}
              required
            />
            <Input id="numDoc" label="Número de documento" value={form.numDoc} onChange={handleChange} error={errores.numDoc} required maxLength={12} placeholder="Ej: 1020304050" />
            <Input id="direccion" label="Dirección de residencia" value={form.direccion} onChange={handleChange} error={errores.direccion} required maxLength={100} className="sm:col-span-2" placeholder="Ej: Calle 45 # 12-34" />
            <Input id="telefono" label="Teléfono de contacto" value={form.telefono} onChange={handleChange} error={errores.telefono} required maxLength={10} placeholder="Ej: 3001234567" />
            <Input id="email" label="Correo electrónico" type="email" value={form.email} onChange={handleChange} error={errores.email} required maxLength={80} placeholder="usuario@correo.com" />
            <Input id="password" label="Contraseña" type="password" value={form.password} onChange={handleChange} error={errores.password} required placeholder="Mínimo 8 caracteres" />
            <Input id="confirmar" label="Confirmar contraseña" type="password" value={form.confirmar} onChange={handleChange} error={errores.confirmar} required placeholder="Repite tu contraseña" />

            <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={onCerrar} disabled={cargando}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={cargando}>
                {cargando ? 'Registrando en BD...' : 'Registrarse'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const TIPOS_DOC = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const ROLES = [
  { value: '1', label: 'Administrador' },
  { value: '2', label: 'Empleado' },
  { value: '3', label: 'Cliente' },
];

const ESTADOS = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telefonoRegex = /^[0-9]{7,10}$/;
const docRegex = /^[0-9]{5,12}$/;
const soloLetras = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/;

function validarUsuario(form, modo) {
  const err = {};

  // Nombres
  if (!form.nombres.trim()) err.nombres = 'El nombre es obligatorio.';
  else if (!soloLetras.test(form.nombres)) err.nombres = 'Solo se permiten letras.';
  else if (form.nombres.trim().length < 2) err.nombres = 'Mínimo 2 caracteres.';
  else if (form.nombres.trim().length > 40) err.nombres = 'Máximo 40 caracteres.';

  // Apellidos
  if (!form.apellidos.trim()) err.apellidos = 'El apellido es obligatorio.';
  else if (!soloLetras.test(form.apellidos)) err.apellidos = 'Solo se permiten letras.';
  else if (form.apellidos.trim().length < 2) err.apellidos = 'Mínimo 2 caracteres.';
  else if (form.apellidos.trim().length > 40) err.apellidos = 'Máximo 40 caracteres.';

  // Tipo de documento
  if (!form.tipo_documento) err.tipo_documento = 'Selecciona un tipo de documento.';

  // Número de documento
  if (!form.numero_documento.trim()) err.numero_documento = 'El número de documento es obligatorio.';
  else if (!docRegex.test(form.numero_documento.trim())) err.numero_documento = 'Debe tener entre 5 y 12 dígitos numéricos.';

  // Dirección
  if (!form.direccion.trim()) err.direccion = 'La dirección es obligatoria.';
  else if (form.direccion.trim().length < 5) err.direccion = 'Mínimo 5 caracteres.';
  else if (form.direccion.trim().length > 40) err.direccion = 'Máximo 40 caracteres.';

  // Teléfono
  if (!form.telefono.trim()) err.telefono = 'El teléfono es obligatorio.';
  else if (!telefonoRegex.test(form.telefono.trim())) err.telefono = 'Debe tener entre 7 y 10 dígitos numéricos.';

  // Email
  if (!form.email.trim()) err.email = 'El correo electrónico es obligatorio.';
  else if (!emailRegex.test(form.email.trim())) err.email = 'Formato de correo electrónico inválido.';
  else if (form.email.trim().length > 40) err.email = 'Máximo 40 caracteres.';

  // Contraseña
  if (modo === 'crear') {
    if (!form.password) err.password = 'La contraseña inicial es obligatoria.';
    else if (form.password.length < 8) err.password = 'Mínimo 8 caracteres.';
    else if (form.password.length > 40) err.password = 'Máximo 40 caracteres.';
  } else if (form.password && form.password.trim()) {
    if (form.password.length < 8) err.password = 'Mínimo 8 caracteres si deseas cambiarla.';
    else if (form.password.length > 40) err.password = 'Máximo 40 caracteres.';
  }

  // Rol
  if (!form.id_rol) err.id_rol = 'Selecciona un rol.';

  // Estado
  if (!form.estado) err.estado = 'Selecciona un estado.';

  return err;
}

const FORM_INICIAL = {
  nombres: '',
  apellidos: '',
  tipo_documento: 'CC',
  numero_documento: '',
  direccion: '',
  telefono: '',
  email: '',
  password: '',
  id_rol: '3',
  estado: 'Activo',
};

export default function UserFormModal({ abierto, modo, datos, onCerrar, onGuardar }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [touched, setTouched] = useState({});
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (abierto) {
      if (modo === 'editar' && datos) {
        setForm({
          nombres: datos.nombres || '',
          apellidos: datos.apellidos || '',
          tipo_documento: datos.tipo_documento || 'CC',
          numero_documento: datos.numero_documento || '',
          direccion: datos.direccion || '',
          telefono: datos.telefono || '',
          email: datos.email || '',
          password: '',
          id_rol: String(datos.id_rol || 3),
          estado: datos.estado || 'Activo',
        });
      } else {
        setForm(FORM_INICIAL);
      }
      setTouched({});
      setErrores({});
      setErrorServidor('');
      setCargando(false);
    }
  }, [abierto, modo, datos]);

  useEffect(() => {
    if (!abierto) return;
    const allErrors = validarUsuario(form, modo);
    const activeErrors = {};
    Object.keys(allErrors).forEach((key) => {
      if (touched[key]) {
        activeErrors[key] = allErrors[key];
      }
    });
    setErrores(activeErrors);
  }, [form, touched, modo, abierto]);

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (['numero_documento', 'telefono'].includes(id) && /[^0-9]/.test(value)) return;
    setTouched((prev) => ({ ...prev, [id]: true }));
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrorServidor('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {
      nombres: true,
      apellidos: true,
      tipo_documento: true,
      numero_documento: true,
      direccion: true,
      telefono: true,
      email: true,
      password: true,
      id_rol: true,
      estado: true,
    };
    setTouched(allTouched);

    const validationErrors = validarUsuario(form, modo);
    if (Object.keys(validationErrors).length > 0) {
      setErrores(validationErrors);
      return;
    }

    try {
      setCargando(true);
      setErrorServidor('');
      await onGuardar(form);
    } catch (err) {
      setErrorServidor(err.message || 'Error al procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={modo === 'crear' ? 'Nuevo Usuario' : 'Editar Usuario'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {errorServidor && (
          <div className="sm:col-span-2 p-3 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorServidor}</span>
          </div>
        )}

        <Input
          id="nombres"
          label="Nombres"
          value={form.nombres}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errores.nombres}
          helperText="Máx. 40 caracteres (solo letras)"
          required
          maxLength={40}
        />

        <Input
          id="apellidos"
          label="Apellidos"
          value={form.apellidos}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errores.apellidos}
          helperText="Máx. 40 caracteres (solo letras)"
          required
          maxLength={40}
        />

        <Select
          id="tipo_documento"
          label="Tipo Documento"
          value={form.tipo_documento}
          onChange={(e) => {
            setTouched((prev) => ({ ...prev, tipo_documento: true }));
            setForm((prev) => ({ ...prev, tipo_documento: e.target.value }));
          }}
          options={TIPOS_DOC}
          error={errores.tipo_documento}
          required
        />

        <Input
          id="numero_documento"
          label="N° Documento"
          value={form.numero_documento}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errores.numero_documento}
          helperText="Entre 5 y 12 dígitos"
          required
          maxLength={12}
          placeholder="Ej: 1020304050"
        />

        <Input
          id="email"
          label="Correo Electrónico"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errores.email}
          helperText="Máx. 40 caracteres"
          required
          maxLength={40}
          placeholder="usuario@correo.com"
        />

        <Input
          id="telefono"
          label="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errores.telefono}
          helperText="Entre 7 y 10 dígitos"
          required
          maxLength={10}
          placeholder="Ej: 3001234567"
        />

        <Input
          id="direccion"
          label="Dirección"
          value={form.direccion}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errores.direccion}
          helperText="Máx. 40 caracteres"
          required
          maxLength={40}
          className="sm:col-span-2"
          placeholder="Ej: Calle 45 # 12-34"
        />

        <Select
          id="id_rol"
          label="Rol de Usuario"
          value={form.id_rol}
          onChange={(e) => {
            setTouched((prev) => ({ ...prev, id_rol: true }));
            setForm((prev) => ({ ...prev, id_rol: e.target.value }));
          }}
          options={ROLES}
          error={errores.id_rol}
          required
        />

        <Select
          id="estado"
          label="Estado"
          value={form.estado}
          onChange={(e) => {
            setTouched((prev) => ({ ...prev, estado: true }));
            setForm((prev) => ({ ...prev, estado: e.target.value }));
          }}
          options={ESTADOS}
          error={errores.estado}
          required
        />

        {modo === 'crear' ? (
          <Input
            id="password"
            label="Contraseña Inicial"
            type="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errores.password}
            helperText="Entre 8 y 40 caracteres"
            required
            maxLength={40}
            placeholder="Mínimo 8 caracteres"
            className="sm:col-span-2"
          />
        ) : (
          <Input
            id="password"
            label="Nueva Contraseña (Opcional)"
            type="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errores.password}
            helperText="Dejar vacío para conservar la contraseña actual"
            maxLength={40}
            placeholder="Opcional (Mínimo 8 caracteres)"
            className="sm:col-span-2"
          />
        )}

        <div className="sm:col-span-2 flex justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

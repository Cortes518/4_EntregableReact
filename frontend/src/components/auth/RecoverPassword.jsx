import { useState } from 'react';
import { authService } from '../../services/authService';
import Input from '../ui/Input';
import Button from '../ui/Button';

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RecoverPassword({ onVolver }) {
  const [paso, setPaso] = useState(1); // 1: Solicitar código, 2: Ingresar código y nueva contraseña, 3: Éxito
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const [error, setError] = useState('');
  const [mensajeInfo, setMensajeInfo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  // Paso 1: Enviar código al correo
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!validarEmail(email.trim())) {
      setError('Formato de correo electrónico inválido.');
      return;
    }

    try {
      setCargando(true);
      setError('');
      setMensajeInfo('');
      const data = await authService.forgotPassword(email.trim());
      setMensajeInfo(data.message || 'Código enviado exitosamente a tu correo.');
      setPaso(2);
    } catch (err) {
      setError(err.message || 'Error al enviar el código de recuperación.');
    } finally {
      setCargando(false);
    }
  };

  // Reenviar código
  const handleReenviarCodigo = async () => {
    try {
      setReenviando(true);
      setError('');
      await authService.forgotPassword(email.trim());
      setMensajeInfo('Se ha reenviado un nuevo código a tu correo.');
    } catch (err) {
      setError(err.message || 'Error al reenviar el código.');
    } finally {
      setReenviando(false);
    }
  };

  // Paso 2: Validar código y cambiar contraseña
  const handleRestablecer = async (e) => {
    e.preventDefault();
    setError('');

    if (!codigo.trim()) {
      setError('Por favor ingresa el código de 6 dígitos que recibiste.');
      return;
    }
    if (codigo.trim().length < 5) {
      setError('El código ingresado es demasiado corto.');
      return;
    }
    if (!nuevaPassword) {
      setError('La nueva contraseña es obligatoria.');
      return;
    }
    if (nuevaPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaPassword.length > 30) {
      setError('La nueva contraseña no puede exceder los 30 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden. Verifícalas e intenta de nuevo.');
      return;
    }

    try {
      setCargando(true);
      setError('');
      await authService.resetPassword(email.trim(), codigo.trim(), nuevaPassword);
      setPaso(3);
    } catch (err) {
      setError(err.message || 'No se pudo restablecer la contraseña. Verifica el código ingresado.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in">
        
        {/* Encabezado */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full">
            Seguridad de Cuenta
          </span>
          <h1 className="text-2xl font-bold text-white mt-2 mb-1">Recuperar contraseña</h1>
          <p className="text-slate-400 text-sm">
            {paso === 1 && 'Ingresa tu correo y te enviaremos un código de seguridad para restablecerla.'}
            {paso === 2 && 'Ingresa el código enviado a tu correo y define tu nueva contraseña.'}
            {paso === 3 && 'Proceso completado con éxito.'}
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-start gap-2.5">
            <span className="font-bold text-base leading-none">⚠️</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Mensaje Informativo / Éxito temporal */}
        {mensajeInfo && paso === 2 && (
          <div className="mb-5 p-3.5 bg-sky-950/60 border border-sky-500/40 rounded-xl text-sky-200 text-sm flex items-start gap-2.5">
            <span className="font-bold text-base leading-none">✉️</span>
            <span className="flex-1">{mensajeInfo}</span>
          </div>
        )}

        {/* ========================================================
            PASO 1: Ingreso de correo para recibir el código
            ======================================================== */}
        {paso === 1 && (
          <form onSubmit={handleSolicitarCodigo} noValidate className="flex flex-col gap-4">
            <Input
              id="recover-email"
              label="Correo electrónico registrado"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="tu_correo@gmail.com"
              helperText="Enviaremos un código numérico a esta dirección"
              required
            />

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={cargando}>
              {cargando ? 'Enviando correo...' : 'Enviar código de recuperación'}
            </Button>
          </form>
        )}

        {/* ========================================================
            PASO 2: Ingreso de código de verificación y nueva contraseña
            ======================================================== */}
        {paso === 2 && (
          <form onSubmit={handleRestablecer} noValidate className="flex flex-col gap-4">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-300 truncate max-w-[260px]">
                Enviado a: <strong className="text-white">{email}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setPaso(1);
                  setError('');
                  setMensajeInfo('');
                }}
                className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 ml-2"
              >
                Cambiar correo
              </button>
            </div>

            <Input
              id="codigo"
              label="Código de verificación"
              type="text"
              value={codigo}
              onChange={(e) => {
                // Solo números, máx 6 dígitos
                const val = e.target.value.replace(/[^0-9]/g, '');
                setCodigo(val);
                setError('');
              }}
              placeholder="Ej: 549102"
              helperText="Código de 6 dígitos recibido en tu bandeja de entrada o spam"
              maxLength={6}
              required
            />

            <Input
              id="nueva-password"
              label="Nueva contraseña"
              type="password"
              value={nuevaPassword}
              onChange={(e) => {
                setNuevaPassword(e.target.value);
                setError('');
              }}
              placeholder="Mínimo 8 caracteres"
              helperText="Entre 8 y 30 caracteres"
              maxLength={30}
              required
            />

            <Input
              id="confirmar-password"
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmarPassword}
              onChange={(e) => {
                setConfirmarPassword(e.target.value);
                setError('');
              }}
              placeholder="Repite la nueva contraseña"
              helperText="Debe coincidir con la contraseña anterior"
              maxLength={30}
              required
            />

            <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
              <span>¿No te llegó el código?</span>
              <button
                type="button"
                onClick={handleReenviarCodigo}
                disabled={reenviando}
                className="text-sky-400 hover:text-sky-300 font-medium transition-colors disabled:opacity-50"
              >
                {reenviando ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={cargando}>
              {cargando ? 'Actualizando contraseña...' : 'Restablecer contraseña'}
            </Button>
          </form>
        )}

        {/* ========================================================
            PASO 3: Confirmación de éxito y retorno a Login
            ======================================================== */}
        {paso === 3 && (
          <div className="flex flex-col items-center text-center py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-3xl mb-4">
              🎉
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¡Contraseña restablecida con éxito!</h2>
            <p className="text-slate-300 text-sm mb-6 max-w-sm">
              Tu contraseña ha sido actualizada en la base de datos. Ya puedes iniciar sesión con tus nuevas credenciales.
            </p>
            <Button onClick={onVolver} variant="primary" className="w-full">
              Iniciar sesión ahora
            </Button>
          </div>
        )}

        {/* Botón Volver al Login */}
        {paso !== 3 && (
          <button
            type="button"
            onClick={onVolver}
            className="mt-6 w-full text-center text-sm text-slate-400 hover:text-sky-400 transition-colors"
          >
            ← Volver al inicio de sesión
          </button>
        )}

      </div>
    </div>
  );
}


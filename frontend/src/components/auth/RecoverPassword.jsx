import { useState } from 'react';
import { authService } from '../../services/authService';
import Input from '../ui/Input';
import Button from '../ui/Button';

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RecoverPassword({ onVolver }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [correoRecibido, setCorreoRecibido] = useState(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (!val) {
      setError('El correo es obligatorio.');
    } else if (!validarEmail(val)) {
      setError('Formato de correo inválido.');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('El correo es obligatorio.');
      return;
    }
    if (!validarEmail(email)) {
      setError('Formato de correo inválido.');
      return;
    }

    try {
      setCargando(true);
      setError('');
      const data = await authService.forgotPassword(email);
      setCorreoRecibido(data.correoFicticio);
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Recuperar contraseña</h1>
        <p className="text-slate-400 text-sm mb-6">
          Ingresa tu correo registrado y te enviaremos el proceso ficticio de recuperación.
        </p>

        {error && (
          <div className="mb-5 p-3 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-start gap-2">
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {correoRecibido ? (
          /* ===================================================
             SIMULACIÓN DE BANDEJA DE CORREO ELECTRÓNICO FICTICIO
             =================================================== */
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Notificación de envío */}
            <div className="p-3 bg-emerald-900/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
              <span>✅</span>
              <span>¡Correo de recuperación enviado con éxito a tu bandeja!</span>
            </div>

            {/* Simulación del Correo Recibido */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-left text-sm shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
                    PC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Soporte PCortes</p>
                    <p className="text-[11px] text-slate-400">&lt;{correoRecibido.remitente}&gt;</p>
                  </div>
                </div>
                <span className="text-[11px] bg-slate-800 text-sky-300 px-2 py-0.5 rounded border border-slate-700">
                  Expira: {correoRecibido.expiraEn}
                </span>
              </div>

              <div className="text-xs text-slate-400 mb-3 space-y-0.5">
                <p><strong className="text-slate-300">Para:</strong> {correoRecibido.destinatario} ({correoRecibido.nombreUsuario})</p>
                <p><strong className="text-slate-300">Asunto:</strong> {correoRecibido.asunto}</p>
              </div>

              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/80 my-3 text-slate-200">
                <p className="font-bold text-white mb-2">Hola {correoRecibido.nombreUsuario},</p>
                <p className="text-xs text-slate-300 mb-3">
                  Recibimos una solicitud para restablecer tu contraseña en la plataforma PCortes. Sigue este proceso:
                </p>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {correoRecibido.pasos.map((paso, idx) => (
                    <p key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-400 font-bold">›</span>
                      <span>{paso}</span>
                    </p>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-sky-950/40 border border-sky-500/30 rounded-lg text-center">
                  <span className="text-xs text-slate-400 block mb-1">Tu Código de Seguridad Temporal:</span>
                  <span className="text-lg font-mono font-extrabold text-sky-400 tracking-wider">
                    {correoRecibido.codigoSeguridad}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                * Este es un correo del proceso simulado de recuperación de cuenta del SENA.
              </p>
            </div>

            <Button
              onClick={() => {
                alert(`¡Simulación completada! Se ha verificado tu código ${correoRecibido.codigoSeguridad}. Ya puedes iniciar sesión con tu cuenta.`);
                onVolver();
              }}
              variant="primary"
              className="w-full"
            >
              Simular Restablecimiento y Volver
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="recover-email"
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              error={error}
              required
            />
            <Button type="submit" variant="primary" className="w-full" disabled={cargando}>
              {cargando ? 'Generando y enviando correo...' : 'Enviar correo de recuperación'}
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={onVolver}
          className="mt-5 w-full text-center text-sm text-slate-400 hover:text-sky-400 transition-colors"
        >
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}

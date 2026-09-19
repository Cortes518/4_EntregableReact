import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatbotService } from '../../services/chatbotService';
import { useAuth } from '../../context/AuthContext';

export default function ChatbotWidget() {
  const { user } = useAuth();
  const location = useLocation();

  // Ocultar el asistente IA en los paneles de administrador, empleado y cliente
  const esPanel = ['/admin', '/empleado', '/cliente'].some((path) =>
    location.pathname.startsWith(path)
  );

  if (esPanel) return null;

  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      role: 'assistant',
      content: `¡Hola${user?.nombres ? ' ' + user.nombres : ''}! 👋 Soy el Asistente Virtual de **PCortes** con Inteligencia Artificial.\n\nPuedo orientarte sobre:\n• 💻 Catálogo de computadores y precios en vivo\n• 🛠️ Servicios técnicos y mantenimiento\n• 🛒 Proceso de compra y pagos\n• 📋 Cómo radicar y consultar tus solicitudes **PQR**\n\n¿En qué te puedo colaborar hoy?`,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [idConversacion, setIdConversacion] = useState(null);
  const [sugerencias, setSugerencias] = useState([
    '¿Qué computadores tienen?',
    '¿Cómo radico una PQR?',
    '¿Cómo comprar en línea?',
    'Servicios técnicos',
    'Horarios y contacto',
  ]);

  const finalMensajesRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (abierto) {
      finalMensajesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, cargando, abierto]);

  // Foco en input al abrir
  useEffect(() => {
    if (abierto) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [abierto]);

  const handleEnviar = async (textoAEnviar) => {
    const texto = (textoAEnviar || entrada).trim();
    if (!texto || cargando) return;

    const nuevoMsgUser = {
      role: 'user',
      content: texto,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nuevosMensajes = [...mensajes, nuevoMsgUser];
    setMensajes(nuevosMensajes);
    setEntrada('');
    setCargando(true);

    try {
      // Historial para enviar a la API (solo role y content)
      const historialApi = nuevosMensajes.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatbotService.enviarMensaje({
        mensaje: texto,
        historial: historialApi,
        id_conversacion: idConversacion,
      });

      if (res.id_conversacion) {
        setIdConversacion(res.id_conversacion);
      }

      const nuevoMsgBot = {
        role: 'assistant',
        content: res.respuesta || 'Disculpa, no pude procesar tu solicitud.',
        proveedor: res.proveedor,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMensajes((prev) => [...prev, nuevoMsgBot]);

      if (Array.isArray(res.sugerencias) && res.sugerencias.length > 0) {
        setSugerencias(res.sugerencias);
      }
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Ocurrió un error al conectar con el servidor. Por favor verifica que el backend esté en ejecución.',
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const limpiarConversacion = () => {
    setIdConversacion(null);
    setMensajes([
      {
        role: 'assistant',
        content: `Conversación reiniciada. ¡Hola${user?.nombres ? ' ' + user.nombres : ''}! ¿Qué duda deseas consultar sobre PCortes?`,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Renderizar texto con formato markdown básico (negritas, saltos, listas)
  const renderContenido = (texto) => {
    const lineas = texto.split('\n');
    return lineas.map((linea, idx) => {
      // Reemplazo básico de **negrita**
      const partes = linea.split(/(\*\*.*?\*\*)/g);
      const lineaRender = partes.map((parte, i) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return <strong key={i} className="font-bold text-white">{parte.slice(2, -2)}</strong>;
        }
        return parte;
      });

      return (
        <span key={idx} className="block leading-relaxed">
          {lineaRender}
          {idx < lineas.length - 1 && <span className="h-1 block" />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Botón Flotante Disparador */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setAbierto(!abierto)}
          aria-label={abierto ? 'Cerrar Chatbot' : 'Abrir Chatbot Asistente IA'}
          className="w-14 h-14 bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-sky-500/40"
        >
          {/* Pulso de fondo */}
          <span className="absolute inset-0 rounded-full bg-sky-400 opacity-60 animate-ping group-hover:opacity-90"></span>

          {abierto ? (
            <span className="text-2xl font-bold relative z-10">&times;</span>
          ) : (
            <span className="text-2xl relative z-10">🤖</span>
          )}

          {/* Badge indicador */}
          {!abierto && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full z-20"></span>
          )}
        </button>
      </div>

      {/* Ventana Flotante del Chatbot */}
      {abierto && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] max-h-[82vh] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden animate-scale-in origin-bottom-right text-slate-100"
          role="dialog"
          aria-label="Ventana de Chat Asistente Virtual"
        >
          {/* Encabezado */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-md shadow-sky-500/20">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Asistente PCortes</span>
                  <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] font-bold rounded-md">
                    IA
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En línea • Soporte 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={limpiarConversacion}
                title="Reiniciar conversación"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
              >
                🔄
              </button>
              <button
                onClick={() => setAbierto(false)}
                title="Minimizar chat"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-lg leading-none transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-950/40">
            {mensajes.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-sky-600/30 border border-sky-500/40 text-sky-300 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 shadow-md ${
                    m.role === 'user'
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  <div>{renderContenido(m.content)}</div>
                  <div
                    className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                      m.role === 'user' ? 'text-sky-200' : 'text-slate-500'
                    }`}
                  >
                    <span>{m.hora}</span>
                    {m.proveedor && (
                      <span className="text-[8px] opacity-70">
                        • {m.proveedor === 'openai' ? 'OpenAI' : m.proveedor === 'gemini' ? 'Gemini' : 'PCortes'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Animación Escribiendo... */}
            {cargando && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-sky-600/30 border border-sky-500/40 text-sky-300 flex items-center justify-center text-xs shrink-0">
                  🤖
                </div>
                <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl px-4 py-3 rounded-bl-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={finalMensajesRef} />
          </div>

          {/* Chips de Preguntas Frecuentes / Sugerencias */}
          {sugerencias.length > 0 && !cargando && (
            <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/80 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {sugerencias.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleEnviar(sug)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-sky-600/30 text-slate-300 hover:text-sky-300 border border-slate-700/70 hover:border-sky-500/50 rounded-lg text-[11px] font-medium transition-all text-left cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Campo de Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEnviar();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Pregunta sobre productos, PQR, compras..."
              disabled={cargando}
              className="flex-1 bg-slate-800/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!entrada.trim() || cargando}
              className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
              title="Enviar mensaje"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

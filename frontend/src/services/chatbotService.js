import { apiRequest } from './api';

export const chatbotService = {
  /**
   * Enviar mensaje al chatbot con historial de conversación y persistencia.
   * @param {Object} payload - { mensaje: string, historial: Array<{role: string, content: string}>, id_conversacion?: number }
   */
  enviarMensaje: async ({ mensaje, historial = [], id_conversacion = null }) => {
    return apiRequest('/chatbot/message', {
      method: 'POST',
      body: { mensaje, historial, id_conversacion },
    });
  },

  /**
   * Obtener sugerencias iniciales de preguntas frecuentes.
   */
  obtenerSugerencias: async () => {
    return apiRequest('/chatbot/sugerencias');
  },

  /**
   * Obtener historial de conversaciones almacenadas en base de datos.
   */
  obtenerConversaciones: async () => {
    return apiRequest('/chatbot/conversaciones');
  },

  /**
   * Obtener mensajes de una conversación específica.
   */
  obtenerMensajesConversacion: async (idConversacion) => {
    return apiRequest(`/chatbot/conversaciones/${idConversacion}/mensajes`);
  },
};

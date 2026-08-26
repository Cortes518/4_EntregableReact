const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Cliente HTTP centralizado para peticiones a la API
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
  const token = localStorage.getItem('pcortes_token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const config = {
    method,
    headers: defaultHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Si el token expira o es inválido, limpiar sesión
      if (response.status === 401 && token) {
        localStorage.removeItem('pcortes_token');
        localStorage.removeItem('pcortes_user');
        window.dispatchEvent(new Event('auth-logout'));
      }

      const error = new Error(data.message || `Error en la petición (${response.status})`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor backend. Verifica que esté iniciado en el puerto 3000.');
    }
    throw err;
  }
}

export default apiRequest;

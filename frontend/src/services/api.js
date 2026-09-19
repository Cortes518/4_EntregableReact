// URL base configurable para despliegue en la nube (Railway / Vercel) o local
let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api/v1`)
  : 'http://localhost:3000/api/v1';

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
    let cleanEndpoint = endpoint;
    if (cleanEndpoint.startsWith('/api/v1')) {
      cleanEndpoint = cleanEndpoint.substring('/api/v1'.length);
    }
    const url = cleanEndpoint.startsWith('http') ? cleanEndpoint : `${API_BASE_URL}${cleanEndpoint}`;
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Si el token expira o es inválido, limpiar sesión
      if (response.status === 401 && token) {
        localStorage.removeItem('pcortes_token');
        localStorage.removeItem('pcortes_user');
        window.dispatchEvent(new Event('auth-logout'));
      }

      const errorMsg = typeof data.detail === 'string' ? data.detail : (data.message || `Error en la petición (${response.status})`);
      const error = new Error(errorMsg);
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

apiRequest.get = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' });
apiRequest.post = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body });
apiRequest.put = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body });
apiRequest.patch = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body });
apiRequest.delete = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' });

export default apiRequest;

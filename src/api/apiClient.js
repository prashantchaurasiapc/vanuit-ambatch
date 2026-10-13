/**
 * apiClient.js — Central HTTP client for Vanuit Ambacht frontend
 *
 * All API calls MUST go through this module.
 * Handles:
 *  - Cookie-based JWT forwarding (credentials: 'include')
 *  - Standard { success, data, error } response envelope
 *  - Global 401 → redirect to /login
 *  - Global 403 → console warn (caller handles UI)
 */
export const BASE_URL = (
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? '/api'
    : (import.meta.env.VITE_API_BASE_URL || 'https://feisty-beauty-production-2f61.up.railway.app/api')
).replace(/\/+$/, '');

async function request(method, path, body = null, isFormData = false) {
  const headers = {};

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach Authorization header if token is stored (works seamlessly cross-origin, local, or via proxy)
  const token =
    sessionStorage.getItem('va_token') ||
    localStorage.getItem('va_token') ||
    sessionStorage.getItem('auth_token') ||
    localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    credentials: 'include', // Also send/receive HttpOnly JWT cookie when on same origin
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  // Handle 401 globally — notify caller without violently discarding user session on page refreshes
  if (response.status === 401) {
    console.warn('[apiClient] 401 Unauthorized for route:', path);
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired or unauthenticated.' } };
  }

  // Handle 403 globally
  if (response.status === 403) {
    console.warn('[apiClient] 403 Forbidden:', path);
    return { success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } };
  }

  // Parse JSON
  let json;
  try {
    json = await response.json();
  } catch {
    return { success: false, error: { code: 'PARSE_ERROR', message: 'Invalid response from server.' } };
  }

  return json; // { success: true, data: ... } or { success: false, error: ... }
}

const api = {
  get:    (path)              => request('GET',    path),
  post:   (path, body)        => request('POST',   path, body),
  put:    (path, body)        => request('PUT',    path, body),
  patch:  (path, body)        => request('PATCH',  path, body),
  delete: (path)              => request('DELETE', path),
  upload: (path, formData)    => request('POST',   path, formData, true),
};

export default api;

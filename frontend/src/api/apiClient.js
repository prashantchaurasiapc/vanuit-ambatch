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

const BASE_URL = '/api'; // Proxied to http://localhost:3000/api by Vite in dev

async function request(method, path, body = null, isFormData = false) {
  const headers = {};

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const options = {
    method,
    headers,
    credentials: 'include', // Always send/receive HttpOnly JWT cookie
  };

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  // Handle 401 globally — session expired or not logged in
  if (response.status === 401) {
    // Avoid redirect loop on the login page itself
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired. Please log in again.' } };
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

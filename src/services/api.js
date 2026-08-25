// api.js - Cliente HTTP base (fetch nativo, sin axios)

const API_URL = import.meta.env.VITE_API_URL;

function getStoredToken() {
  return localStorage.getItem('prodhab_token');
}

// Limpia la sesión y notifica al AuthContext que el token murió (401)
function handleUnauthorized() {
  localStorage.removeItem('prodhab_token');
  localStorage.removeItem('prodhab_user');
  window.dispatchEvent(new Event('prodhab:unauthorized'));
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  // ASP.NET responde los errores como application/problem+json (RFC 9457),
  // no application/json: hay que aceptar ambos o el detail del backend nunca llega al front.
  const isJson = contentType.includes('json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    const message = body?.detail || body?.title || `Error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = getStoredToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let requestBody = body;
  if (body !== undefined && !isForm) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }
  // Si isForm, no seteamos Content-Type: el browser pone el boundary del multipart

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  return parseResponse(response);
}

export function apiGet(path) {
  return request(path, { method: 'GET' });
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body });
}

export function apiPut(path, body) {
  return request(path, { method: 'PUT', body });
}

export function apiPatch(path, body) {
  return request(path, { method: 'PATCH', body });
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' });
}

// Preparado para multipart (subida de archivos) más adelante
export function apiPostForm(path, formData) {
  return request(path, { method: 'POST', body: formData, isForm: true });
}

// Descarga autenticada (ej. archivo de subsanación): el <a href> directo no
// puede llevar el header Authorization, así que se trae como blob.
export async function apiGetBlob(path) {
  const token = getStoredToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { method: 'GET', headers });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    const error = new Error(`Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.blob();
}

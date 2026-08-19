// authService.js - Login/logout y acceso a la sesión guardada en localStorage

import { apiPost } from './api';

const TOKEN_KEY = 'prodhab_token';
const USER_KEY = 'prodhab_user';

export async function login(email, password) {
  const data = await apiPost('/auth/login', { email, password });

  const user = {
    usuarioId: data.usuarioId,
    nombre: data.nombre,
    email: data.email,
    rol: data.rol,
  };

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function isAuthenticated() {
  const token = getToken();
  return Boolean(token && token.trim().length > 0);
}

// usuarioService.js - Alta, listado y desactivación de usuarios (solo Admin)

import { apiGet, apiPost, apiPatch } from './api';

export function crear({ nombre, email, password, rol }) {
  return apiPost('/usuarios', { nombre, email, password, rol });
}

export function listar() {
  return apiGet('/usuarios');
}

export function desactivar(id) {
  return apiPatch(`/usuarios/${id}/desactivar`);
}

// Devuelve { passwordTemporal }: el backend la genera y la muestra una única vez,
// el Admin la copia y se la comparte al usuario por fuera del sistema.
export function resetearPassword(id) {
  return apiPatch(`/usuarios/${id}/resetear-password`);
}

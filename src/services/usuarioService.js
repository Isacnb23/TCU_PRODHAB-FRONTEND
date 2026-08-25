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

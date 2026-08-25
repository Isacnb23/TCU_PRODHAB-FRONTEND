// notificacionService.js - Notificaciones del usuario autenticado (campana del Header)

import { apiGet, apiPatch } from './api';

export function listar() {
  return apiGet('/notificaciones');
}

export function contarNoLeidas() {
  return apiGet('/notificaciones/no-leidas/count');
}

export function marcarLeida(id) {
  return apiPatch(`/notificaciones/${id}/leer`);
}

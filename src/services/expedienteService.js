// expedienteService.js - Listado, creación, detalle y guardado por paso de expedientes

import { apiGet, apiPost, apiPut } from './api';

export function listar(estado) {
  return estado ? apiGet('/expedientes?estado=' + estado) : apiGet('/expedientes');
}

export function crear({ entidad, anio }) {
  return apiPost('/expedientes', { entidad, anio });
}

export function obtener(id) {
  return apiGet(`/expedientes/${id}`);
}

export function guardarPaso(expedienteId, paso, datosPaso, completado) {
  return apiPut(`/expedientes/${expedienteId}/pasos/${paso}`, {
    datosJson: JSON.stringify(datosPaso),
    completado,
  });
}

export function enviar(expedienteId) {
  return apiPost(`/expedientes/${expedienteId}/enviar`);
}

export function solicitarSubsanacion(id, observaciones) {
  return apiPost(`/expedientes/${id}/solicitar-subsanacion`, { observaciones });
}

export function aprobar(id, numeroExpediente) {
  return apiPost(`/expedientes/${id}/aprobar`, { numeroExpediente });
}

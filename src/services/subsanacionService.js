// subsanacionService.js - Lectura y creación de subsanaciones (wizard del Usuario y panel del Admin)

import { apiGet, apiGetBlob, apiPostForm, apiDelete } from './api';

export function listarPorExpediente(expedienteId) {
  return apiGet(`/expedientes/${expedienteId}/subsanaciones`);
}

export function crear(expedienteId, { paso, campo, textoJustificacion, archivo }) {
  const fd = new FormData();
  fd.append('Paso', paso);
  fd.append('Campo', campo);
  if (textoJustificacion) fd.append('TextoJustificacion', textoJustificacion);
  if (archivo) fd.append('Archivo', archivo);
  return apiPostForm(`/expedientes/${expedienteId}/subsanaciones`, fd);
}

export function eliminar(expedienteId, subsanacionId) {
  return apiDelete(`/expedientes/${expedienteId}/subsanaciones/${subsanacionId}`);
}

export async function descargarArchivo(expedienteId, subsanacionId, nombreArchivo) {
  const blob = await apiGetBlob(`/expedientes/${expedienteId}/subsanaciones/${subsanacionId}/archivo`);
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo || 'archivo';
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

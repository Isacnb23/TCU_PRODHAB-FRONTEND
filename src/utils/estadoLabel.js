// estadoLabel.js - Etiqueta de presentación de un estado de expediente, según
// el rol de quien lo mira. Es solo una capa visual: el valor real de `estado`
// que viaja del backend no cambia y la lógica de negocio sigue comparando
// contra los strings reales ('Enviado', etc.), nunca contra esta etiqueta.
//
// Casos que difieren de mostrar el estado tal cual:
// - 'Enviado' visto por el Admin: para el Usuario dueño sigue diciendo
//   "Enviado", para el Admin dice "Recibido para revisión" (más claro desde
//   su lado del flujo).
// - 'Enviado' que ya tuvo al menos una observación (TieneObservacionesPrevias
//   del backend, es decir, es un reenvío tras subsanación, no el primer
//   envío): para el Admin dice "En segunda revisión", para el Usuario dueño
//   "Enviado con correcciones".
// El resto de los estados (Borrador, RequiereSubsanacion, Aprobado) se
// muestran igual para ambos.
export function etiquetaEstado(estado, rol, tieneObservacionesPrevias = false) {
  if (estado === 'Enviado' && tieneObservacionesPrevias) {
    return rol === 'Admin' ? 'En segunda revisión' : 'Enviado con correcciones';
  }
  if (estado === 'Enviado' && rol === 'Admin') {
    return 'Recibido para revisión';
  }
  return estado;
}

// Clase de color del badge de estado. Reenvíos tras subsanación se marcan en
// naranja para distinguirlos de un primer envío (azul), aunque el `estado`
// real siga siendo 'Enviado' en ambos casos.
export function claseEstado(estado, tieneObservacionesPrevias = false) {
  if (estado === 'Enviado' && tieneObservacionesPrevias) {
    return 'bg-orange-50 text-orange-700 border-orange-200';
  }
  return ESTADO_BADGE[estado] || 'bg-gray-100 text-gray-700 border-gray-300';
}

const ESTADO_BADGE = {
  Borrador: 'bg-gray-100 text-gray-700 border-gray-300',
  Enviado: 'bg-blue-50 text-blue-700 border-blue-200',
  EnRevision: 'bg-amber-50 text-amber-700 border-amber-200',
  RequiereSubsanacion: 'bg-red-50 text-red-700 border-red-200',
  Aprobado: 'bg-green-50 text-green-700 border-green-200',
};

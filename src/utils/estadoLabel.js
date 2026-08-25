// estadoLabel.js - Etiqueta de presentación de un estado de expediente, según
// el rol de quien lo mira. Es solo una capa visual: el valor real de `estado`
// que viaja del backend no cambia y la lógica de negocio sigue comparando
// contra los strings reales ('Enviado', etc.), nunca contra esta etiqueta.
//
// Hoy el único caso que difiere es 'Enviado' visto por el Admin: para el
// Usuario dueño sigue diciendo "Enviado", para el Admin dice "Recibido para
// revisión" (más claro desde su lado del flujo). El resto de los estados
// (Borrador, RequiereSubsanacion, Aprobado) se muestran igual para ambos.
export function etiquetaEstado(estado, rol) {
  if (estado === 'Enviado' && rol === 'Admin') {
    return 'Recibido para revisión';
  }
  return estado;
}

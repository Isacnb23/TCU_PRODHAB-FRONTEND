// estadoLabel.js - Etiqueta de presentación de un estado de expediente, según
// el rol de quien lo mira. Es solo una capa visual: el valor real de `estado`
// que viaja del backend no cambia y la lógica de negocio sigue comparando
// contra los strings reales ('Enviado', etc.), nunca contra esta etiqueta.
//
// Casos que difieren de mostrar el estado tal cual:
// - 'Enviado' + `tieneObservacionesPrevias` (el expediente ya tuvo al menos una
//   observación, o sea que este envío es en realidad un reenvío tras
//   subsanación): Admin ve "En segunda revisión", Usuario ve "Enviado con
//   correcciones", con color naranja de acento.
// - 'Enviado' sin observaciones previas, visto por el Admin: "Recibido para
//   revisión" (más claro desde su lado del flujo), color azul (el de siempre).
// El resto de los estados (Borrador, RequiereSubsanacion, Aprobado) se
// muestran igual para ambos roles y sin color de override.
const COLOR_REENVIO = 'bg-orange-50 text-orange-700 border-orange-200';

export function etiquetaEstado(estado, rol, tieneObservacionesPrevias = false) {
  const esReenvio = estado === 'Enviado' && tieneObservacionesPrevias === true;

  let texto = estado;
  if (esReenvio) {
    texto = rol === 'Admin' ? 'En segunda revisión' : 'Enviado con correcciones';
  } else if (estado === 'Enviado' && rol === 'Admin') {
    texto = 'Recibido para revisión';
  }

  // `color` es un override de las clases Tailwind del badge (naranja) cuando
  // aplica; en cualquier otro caso es null y el llamador sigue usando su
  // propio mapa ESTADO_BADGE de siempre, sin cambios.
  return { texto, color: esReenvio ? COLOR_REENVIO : null };
}

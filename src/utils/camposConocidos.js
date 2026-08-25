// camposConocidos.js - Registro de qué identificadores de `campo` sabe
// ubicar cada Step del wizard dentro de su propio formulario.
//
// Los identificadores son los mismos que ya usa el Admin en
// components/Revision/CampoPaso.jsx: la clave real del dato dentro del
// datosJson de ese paso (ej. "nombreBD"), o para arrays de objetos
// `${claveArray}[${fila}].${columna}` (ej. "bases[0].nombre"), o para
// Amenazas `ambito_{id}_q_{indice}`. Ese mismo particionado de datos por
// paso es el que ya usa pasoMapper.js (extraerDatosPaso/fusionarDatosPaso),
// así que las claves de arriba coinciden 1:1 con los `name`/keys reales que
// cada Step lee y escribe.
//
// WizardContainer usa esto SOLO para decidir si una observación del Admin
// se puede anclar a un campo puntual dentro del Step (y así evitar
// duplicar su texto en el banner genérico) o si debe degradar con gracia
// mostrando el texto completo en ese banner de nivel de paso.

const CAMPOS_EXACTOS = {
  1: [
    'entidad', 'nombreBD', 'gestorBD', 'versionBD', 'diagramaER', 'ano',
    'responsable', 'contacto', 'area', 'cantidadLicencias', 'cantidadUsuarios',
    'alojamiento', 'acceso', 'mecanismoDerechos', 'fechaCreacion',
  ],
  4: ['finalidad', 'baseLegal'],
  5: ['realizaTransferencias', 'justificacionGeneral'],
};

const CAMPOS_PREFIJOS = {
  2: ['bases['],
  4: ['datosRecopilados['],
  5: ['transferencias['],
  6: ['riesgos['],
  7: ['controles['],
};

const CAMPO_AMENAZAS = /^ambito_\d+_q_\d+$/;

// ¿Este Step sabe ubicar el campo `campo` dentro de su propio formulario?
export function tieneCampoConocido(paso, campo) {
  if (!campo) return false;
  if (paso === 3) return CAMPO_AMENAZAS.test(campo);
  if ((CAMPOS_EXACTOS[paso] || []).includes(campo)) return true;
  return (CAMPOS_PREFIJOS[paso] || []).some((prefijo) => campo.startsWith(prefijo));
}

// pasoMapper.js - Mapeo formData <-> JSON por paso, compartido por
// rehidratar (Parte 2a) y guardar (Parte 2b).
//
// formSchema.json NO define campos por paso (solo metadatos generales del
// formulario), así que no sirve como fuente de verdad para el agrupamiento.
// En cambio, WizardContainer.jsx ya parte formData en una clave top-level
// por paso -  `step{N}_{nombre}` (ver STEPS_COMPONENTS/getStepName ahí) - y
// cada Step lee/escribe únicamente su propia clave. Esa partición natural
// del wizard es la fuente de verdad más robusta: es la misma que ya usan
// los 9 formularios en producción, así que usarla garantiza que
// extraerDatosPaso/fusionarDatosPaso queden sincronizados con lo que cada
// Step realmente produce.

const NOMBRES_PASO = {
  1: 'general',
  2: 'inventario',
  3: 'amenazas',
  4: 'finalidad',
  5: 'transferencia',
  6: 'riesgos',
  7: 'seguridad',
  8: 'adicionales',
  9: 'revision',
};

export function obtenerClavePaso(paso) {
  const nombre = NOMBRES_PASO[paso];
  if (!nombre) {
    throw new Error(`Paso inválido: ${paso}`);
  }
  return `step${paso}_${nombre}`;
}

// Devuelve SOLO los datos del paso indicado (lo que se serializa a datosJson)
export function extraerDatosPaso(formData, paso) {
  const clave = obtenerClavePaso(paso);
  return { ...(formData?.[clave] ?? {}) };
}

// Devuelve un NUEVO formData con los datos del paso indicado sobrescritos
// por datosPaso (ya parseado del datosJson guardado). No muta formData.
export function fusionarDatosPaso(formData, paso, datosPaso) {
  const clave = obtenerClavePaso(paso);
  return {
    ...formData,
    [clave]: { ...(datosPaso ?? {}) },
  };
}

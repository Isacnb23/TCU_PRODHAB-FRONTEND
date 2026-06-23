/**
 * riskCalculator.js - Funciones de cálculo de riesgo PURAS
 */

/**
 * Calcular NRI (Número Riesgo Inherente)
 */
export const calcularNRI = (probabilidad, consecuencia) => {
  return probabilidad * consecuencia;
};

/**
 * Obtener nivel según NRI
 */
export const obtenerNivel = (nri) => {
  if (nri <= 4) {
    return {
      nivel: 'Aceptable',
      color: 'green',
      codigo: 'A',
      descripcion: 'Riesgo aceptable',
    };
  }
  if (nri <= 12) {
    return {
      nivel: 'Tolerable',
      color: 'yellow',
      codigo: 'T',
      descripcion: 'Riesgo tolerable, se debe monitorear',
    };
  }
  if (nri <= 40) {
    return {
      nivel: 'Alto',
      color: 'orange',
      codigo: 'A+',
      descripcion: 'Riesgo alto, requiere acción correctiva',
    };
  }
  return {
    nivel: 'Muy Alto',
    color: 'red',
    codigo: 'MA',
    descripcion: 'Riesgo muy alto, requiere acción inmediata',
  };
};

/**
 * Calcular promedio de amenazas por ámbito
 */
export const calcularPromedioAmenazas = (respuestas, numAmbitos = 4) => {
  let totalSI = 0;

  for (let ambito = 1; ambito <= numAmbitos; ambito++) {
    for (let pregunta = 1; pregunta <= 5; pregunta++) {
      const clave = `ambito_${ambito}_q_${pregunta}`;
      if (respuestas[clave] === 'si') totalSI++;
    }
  }

  return Math.round((totalSI / (numAmbitos * 5)) * 100); // Porcentaje
};

/**
 * Obtener resumen de riesgos
 */
export const obtenerResumenRiesgos = (riesgos) => {
  const resumen = {
    total: riesgos.length,
    aceptables: 0,
    tolerables: 0,
    altos: 0,
    muyAltos: 0,
    promedio: 0,
  };

  let sumaTotal = 0;

  riesgos.forEach((riesgo) => {
    const nri = calcularNRI(riesgo.probabilidad, riesgo.consecuencia);
    const { nivel } = obtenerNivel(nri);

    sumaTotal += nri;

    if (nivel === 'Aceptable') resumen.aceptables++;
    if (nivel === 'Tolerable') resumen.tolerables++;
    if (nivel === 'Alto') resumen.altos++;
    if (nivel === 'Muy Alto') resumen.muyAltos++;
  });

  resumen.promedio = resumen.total > 0 ? Math.round(sumaTotal / resumen.total) : 0;

  return resumen;
};

/**
 * Validar que riesgos críticos tengan medidas
 */
export const validarCoberturaMedidas = (riesgos, controles) => {
  const riesgosCriticos = riesgos.filter((r) => {
    const nri = calcularNRI(r.probabilidad, r.consecuencia);
    return nri > 12; // Alto o Muy Alto
  });

  return {
    riesgosCriticos: riesgosCriticos.length,
    controlesImplementados: controles.filter((c) => c.estado === 'Implementado').length,
    cobertura: riesgosCriticos.length > 0
      ? Math.round(
          (controles.filter((c) => c.estado === 'Implementado').length /
            riesgosCriticos.length) *
            100
        )
      : 100,
  };
};
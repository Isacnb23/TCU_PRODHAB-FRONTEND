import { useMemo } from 'react';

/**
 * useRiskCalculator.js - Hook para cálculos de riesgo
 * 
 * Responsabilidades:
 * - Calcular NRI (Número Riesgo Inherente)
 * - Determinar nivel (Aceptable, Tolerable, Alto, Muy Alto)
 * - Obtener color según nivel
 */

const CONSECUENCIAS = [
  { id: 1, nombre: 'Insignificante', valor: 1 },
  { id: 2, nombre: 'Leve', valor: 2 },
  { id: 3, nombre: 'Moderado', valor: 4 },
  { id: 4, nombre: 'Pesado', valor: 8 },
  { id: 5, nombre: 'Severo', valor: 16 },
];

export const useRiskCalculator = () => {
  /**
   * Calcular NRI
   */
  const calcularNRI = useMemo(() => {
    return (probabilidad, consecuencia) => {
      const consObj = CONSECUENCIAS.find((c) => c.id === consecuencia);
      return probabilidad * (consObj?.valor || 1);
    };
  }, []);

  /**
   * Obtener nivel según NRI
   */
  const obtenerNivel = useMemo(() => {
    return (nri) => {
      if (nri <= 4)
        return { nivel: 'Aceptable', color: 'green', clase: 'bg-green-100 text-green-800' };
      if (nri <= 12)
        return { nivel: 'Tolerable', color: 'yellow', clase: 'bg-yellow-100 text-yellow-800' };
      if (nri <= 40)
        return { nivel: 'Alto', color: 'orange', clase: 'bg-orange-100 text-orange-800' };
      return { nivel: 'Muy Alto', color: 'red', clase: 'bg-red-100 text-red-800' };
    };
  }, []);

  /**
   * Obtener descripción del nivel
   */
  const obtenerDescripcion = useMemo(() => {
    return (nri) => {
      if (nri <= 4) return 'Riesgo bajo, se puede aceptar';
      if (nri <= 12) return 'Riesgo moderado, se debe monitorear';
      if (nri <= 40) return 'Riesgo alto, requiere acción correctiva';
      return 'Riesgo muy alto, requiere acción inmediata';
    };
  }, []);

  return {
    calcularNRI,
    obtenerNivel,
    obtenerDescripcion,
  };
};
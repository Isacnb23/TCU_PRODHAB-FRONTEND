import { useState, useCallback } from 'react';

/**
 * useFormData.js - Hook para gestionar estado global del formulario
 * 
 * Responsabilidades:
 * - Mantener estado de todos los pasos
 * - Actualizar campos específicos
 * - Recuperar datos de un paso
 * - Sincronizar con componentes
 */

export const useFormData = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);

  /**
   * Actualizar un campo específico en un paso
   */
  const updateField = useCallback((step, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value,
      },
    }));
  }, []);

  /**
   * Actualizar todo un paso
   */
  const updateStep = useCallback((step, data) => {
    setFormData((prev) => ({
      ...prev,
      [step]: data,
    }));
  }, []);

  /**
   * Obtener datos de un paso
   */
  const getStep = useCallback((step) => {
    return formData[step] || {};
  }, [formData]);

  /**
   * Obtener todos los datos
   */
  const getAllData = useCallback(() => {
    return formData;
  }, [formData]);

  /**
   * Limpiar datos (reset)
   */
  const resetData = useCallback(() => {
    setFormData({});
  }, []);

  /**
   * Limpiar un paso específico
   */
  const resetStep = useCallback((step) => {
    setFormData((prev) => ({
      ...prev,
      [step]: {},
    }));
  }, []);

  return {
    formData,
    updateField,
    updateStep,
    getStep,
    getAllData,
    resetData,
    resetStep,
  };
};
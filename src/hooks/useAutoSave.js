import { useEffect, useRef } from 'react';

/**
 * useAutoSave.js - Hook para guardado automático en localStorage
 * 
 * Responsabilidades:
 * - Guardar datos automáticamente cada 30 segundos
 * - Recuperar datos guardados al iniciar
 * - Evitar guardar si no hay cambios
 * - Mostrar estado (guardando, guardado)
 */

export const useAutoSave = (data, key = 'prodhab_formData', interval = 30000) => {
  const isSaving = useRef(false);
  const lastSavedData = useRef(null);

  /**
   * Guardar datos en localStorage
   */
  const saveToStorage = (dataToSave) => {
    try {
      isSaving.current = true;
      const serialized = JSON.stringify(dataToSave);
      localStorage.setItem(key, serialized);
      lastSavedData.current = dataToSave;
      console.log('✅ Datos guardados automáticamente');
      return true;
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      return false;
    } finally {
      isSaving.current = false;
    }
  };

  /**
   * Cargar datos de localStorage
   */
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        lastSavedData.current = parsed;
        console.log('✅ Datos cargados desde guardado previo');
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('❌ Error al cargar:', error);
      return null;
    }
  };

  /**
   * Limpiar datos guardados
   */
  const clearStorage = () => {
    try {
      localStorage.removeItem(key);
      lastSavedData.current = null;
      console.log('✅ Datos locales limpios');
    } catch (error) {
      console.error('❌ Error al limpiar:', error);
    }
  };

  /**
   * Guardar automáticamente cada intervalo
   */
  useEffect(() => {
    // Solo guardar si hay cambios
    if (!isSaving.current && JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
      saveToStorage(data);
    }

    // Configurar guardado automático cada 30s
    const interval_id = setInterval(() => {
      if (!isSaving.current && JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
        saveToStorage(data);
      }
    }, interval);

    // Limpiar interval al desmontar
    return () => clearInterval(interval_id);
  }, [data, key, interval]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
    isSaving: isSaving.current,
  };
};
/**
 * validators.js - Funciones de validación PURAS (sin React)
 * 
 * Usado en: Step1, Step2, Step4, etc.
 */

/**
 * Validar email
 */
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar versión de BD (formato: X.X)
 */
export const validarVersionBD = (version) => {
  const regex = /\d+\.\d+/;
  return regex.test(version);
};

/**
 * Validar campo requerido
 */
export const validarRequerido = (valor) => {
  if (typeof valor === 'string') {
    return valor.trim().length > 0;
  }
  return valor !== null && valor !== undefined && valor !== '';
};

/**
 * Validar longitud mínima
 */
export const validarLongitud = (valor, minimo = 3) => {
  if (typeof valor === 'string') {
    return valor.trim().length >= minimo;
  }
  return false;
};

/**
 * Validar archivo (formato y tamaño)
 */
export const validarArchivo = (file, formatosPermitidos = ['.png', '.pdf', '.jpg'], tamanoMaxMB = 5) => {
  if (!file) return false;

  // Validar formato
  const esFormatoValido = formatosPermitidos.some((f) =>
    file.name.toLowerCase().endsWith(f)
  );

  if (!esFormatoValido) {
    return {
      valido: false,
      error: `Formato inválido. Usa: ${formatosPermitidos.join(', ')}`,
    };
  }

  // Validar tamaño
  const tamanoMB = file.size / (1024 * 1024);
  if (tamanoMB > tamanoMaxMB) {
    return {
      valido: false,
      error: `Archivo muy grande (máx ${tamanoMaxMB}MB)`,
    };
  }

  return { valido: true };
};

/**
 * Validar rango numérico
 */
export const validarRango = (valor, minimo = 0, maximo = 100) => {
  const num = parseInt(valor);
  return num >= minimo && num <= maximo;
};

/**
 * Validar que no esté vacío
 */
export const noEstaVacio = (obj) => {
  if (!obj) return false;
  return Object.keys(obj).length > 0;
};
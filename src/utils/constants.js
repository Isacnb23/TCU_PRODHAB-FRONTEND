/**
 * constants.js - Constantes usadas en toda la app
 */

/**
 * Información de los 8 pasos
 */
export const PASOS_WIZARD = [
  {
    id: 1,
    nombre: 'General',
    titulo: 'Información General',
    descripcion: 'Datos básicos de la entidad y BD',
    icono: '📋',
  },
  {
    id: 2,
    nombre: 'Inventario',
    titulo: 'Inventario de Bases de Datos',
    descripcion: 'Registro de todas las BD',
    icono: '📊',
  },
  {
    id: 3,
    nombre: 'Amenazas',
    titulo: 'Evaluación de Amenazas',
    descripcion: 'Evaluación en 4 ámbitos',
    icono: '⚠️',
  },
  {
    id: 4,
    nombre: 'Finalidad',
    titulo: 'Finalidad y Datos',
    descripcion: 'Propósito y datos recopilados',
    icono: '🎯',
  },
  {
    id: 5,
    nombre: 'Transferencia',
    titulo: 'Transferencias Internacionales',
    descripcion: 'Transferencias a otros países',
    icono: '🔄',
  },
  {
    id: 6,
    nombre: 'Riesgos',
    titulo: 'Gestión de Riesgos',
    descripcion: 'Matriz de riesgos',
    icono: '📈',
  },
  {
    id: 7,
    nombre: 'Seguridad',
    titulo: 'Medidas de Seguridad',
    descripcion: 'Controles implementados',
    icono: '🔒',
  },
  {
    id: 8,
    nombre: 'Revision',
    titulo: 'Revisión y Exportación',
    descripcion: 'Descarga protocolo',
    icono: '✅',
  },
];

/**
 * Gestores de BD
 */
export const GESTORES_BD = [
  'MySQL',
  'PostgreSQL',
  'Oracle',
  'SQL Server',
  'MongoDB',
  'MariaDB',
  'SQLite',
  'Otro',
];

/**
 * Tipos de datos
 */
export const TIPOS_DATOS = [
  'Identificación',
  'Contacto',
  'Biométrico',
  'Financiero',
  'Médico',
  'Laboral',
  'Educativo',
  'Judicial',
  'Otro',
];

/**
 * Bases legales
 */
export const BASES_LEGALES = [
  'Ley Nº 8968 (Protección de Datos)',
  'Código de Trabajo',
  'Ley de Seguro Social',
  'Ley General de Salud',
  'Ley Electoral',
  'Ley de Educación',
  'Decreto Ejecutivo',
  'Consentimiento del sujeto',
  'Otra',
];

/**
 * Probabilidades de riesgo
 */
export const PROBABILIDADES = [
  { id: 1, nombre: 'Nunca', descripcion: 'Muy improbable' },
  { id: 2, nombre: 'Casi nunca', descripcion: 'Improbable' },
  { id: 3, nombre: 'Ocasionalmente', descripcion: 'Posible' },
  { id: 4, nombre: 'Casi siempre', descripcion: 'Probable' },
  { id: 5, nombre: 'Siempre', descripcion: 'Muy probable' },
];

/**
 * Consecuencias de riesgo
 */
export const CONSECUENCIAS = [
  { id: 1, nombre: 'Insignificante', valor: 1 },
  { id: 2, nombre: 'Leve', valor: 2 },
  { id: 3, nombre: 'Moderado', valor: 4 },
  { id: 4, nombre: 'Pesado', valor: 8 },
  { id: 5, nombre: 'Severo', valor: 16 },
];

/**
 * Tipos de control de seguridad
 */
export const TIPOS_CONTROL = [
  'Técnico',
  'Administrativo',
  'Físico',
  'Operacional',
];

/**
 * Colores oficiales de marca PRODHAB
 */
export const COLORES_PRODHAB = {
  primary: '#1B2A4A',    // Azul marino institucional
  secondary: '#C9A84C',  // Dorado institucional
  bgApp: '#F8F9FC',      // Fondo general
  textMain: '#1a1a2e',   // Texto principal
  textMuted: '#6b7280',  // Texto secundario
  border: '#e5e7eb',     // Bordes
  danger: '#C55A11',     // Naranja (alertas/riesgo alto)
  success: '#16a34a',    // Verde (estados correctos)
  warning: '#b45309',    // Ámbar (advertencias)
};

/**
 * Configuración de la app
 */
export const CONFIG = {
  version: '1.0.0',
  autor: 'Isaac Navarro - Universidad Fidélitas',
  año: 2026,
  maxFileSize: 5, // MB
  autoSaveInterval: 30000, // 30 segundos
};
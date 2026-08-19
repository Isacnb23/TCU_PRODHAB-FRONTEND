// revisionDisplay.js - Helpers para renderizar los datosJson de cada paso de
// forma legible en el panel de revisión del Admin (NO se usa en el wizard).

export const PASO_TITULOS = {
  1: 'General',
  2: 'Inventario',
  3: 'Amenazas',
  4: 'Finalidad',
  5: 'Transferencia',
  6: 'Riesgos',
  7: 'Seguridad',
  8: 'Adicionales',
  9: 'Revisión',
};

// Los 4 ámbitos y sus 5 preguntas, copiados de Step3_Amenazas.jsx: es la
// fuente de verdad de esas etiquetas y el paso 3 guarda las respuestas como
// `respuestas.ambito_{id}_q_{indice}`, así que reutilizarlas evita mostrar
// claves crípticas tipo "ambito_1_q_1" en la revisión.
export const AMBITOS_AMENAZAS = [
  {
    id: 1,
    nombre: 'Acceso No Autorizado',
    preguntas: [
      'Existen controles de acceso basados en roles',
      'Se registran y monitorean los accesos a la BD',
      'Se utilizan conexiones cifradas (SSL/TLS)',
      'Se implementa autenticación multifactor',
      'Hay auditoría regular de permisos de acceso',
    ],
  },
  {
    id: 2,
    nombre: 'Destrucción de Datos',
    preguntas: [
      'Existen copias de seguridad (backups) regulares',
      'Los backups se prueban periódicamente',
      'Se almacenan en ubicación física diferente',
      'Hay plan de recuperación ante desastres',
      'Se documentan procedimientos de backup y restauración',
    ],
  },
  {
    id: 3,
    nombre: 'Alteración de Datos',
    preguntas: [
      'Se registran cambios en BD (auditoría)',
      'Hay validaciones de integridad de datos',
      'Los cambios requieren autorización',
      'Se mantiene historial de modificaciones',
      'Se detectan cambios anómalos o masivos',
    ],
  },
  {
    id: 4,
    nombre: 'No Disponibilidad',
    preguntas: [
      'Hay redundancia en servidores/infraestructura',
      'Existe plan de continuidad del negocio',
      'Se monitorean tiempos de respuesta',
      'Hay mantenimiento preventivo programado',
      'Se definen SLA (acuerdos de nivel de servicio)',
    ],
  },
];

// "nombreBaseDatos" -> "Nombre Base Datos" (fallback cuando no hay un label curado)
export function humanizarClave(clave) {
  if (!clave) return '';
  const conEspacios = clave
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ');
  return conEspacios
    .split(' ')
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

// Labels curados para el paso 1 (los nombres de campo de Step1_General.jsx no
// son suficientemente descriptivos al humanizarlos automáticamente).
export const LABELS_PASO_1 = {
  entidad: 'Entidad',
  nombreBD: 'Nombre de la Base de Datos',
  gestorBD: 'Gestor de Base de Datos',
  versionBD: 'Versión del Gestor',
  ano: 'Año',
  responsable: 'Responsable',
  contacto: 'Email de Contacto',
  area: 'Área',
  cantidadLicencias: 'Cantidad de Licencias',
  cantidadUsuarios: 'Cantidad de Usuarios',
  alojamiento: 'Alojamiento',
  acceso: 'Acceso / Derechos de Acceso',
  mecanismoDerechos: 'Mecanismo para Ejercicio de Derechos',
  fechaCreacion: 'Fecha de Creación de la BD',
  diagramaER: 'Diagrama Entidad-Relación',
};

export function parsearDatosJson(datosJson) {
  if (!datosJson) return {};
  try {
    const parsed = JSON.parse(datosJson);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

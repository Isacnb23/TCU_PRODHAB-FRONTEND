// sugerirEmail.js - Sugerencia de email a partir de un nombre completo, para
// precargar (no restringir) el campo Email en NuevoUsuarioModal.jsx.

// Dominio institucional configurado para este entorno; puede cambiar.
export const DOMINIO_EMAIL = '@prodhab.protocolos.cr';

// "Juan Pérez González" -> "jperez" + DOMINIO_EMAIL
// Usa la primera palabra (nombre) + la segunda palabra (primer apellido, en la
// convención hispana nombre + primer apellido + segundo apellido) — un tercer
// término o más se ignora. Con una sola palabra, se usa esa palabra completa.
export function sugerirEmail(nombre) {
  const palabras = (nombre || '')
    .normalize('NFD') // separa cada letra acentuada en base + marca diacrítica combinante
    .replace(/[^a-zA-Z\s]/g, '') // se queda solo con letras/espacios: elimina esas marcas y cualquier otro caracter especial
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (palabras.length === 0) return '';

  const base = palabras.length === 1 ? palabras[0] : palabras[0][0] + palabras[1];

  return base.toLowerCase() + DOMINIO_EMAIL;
}

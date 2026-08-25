# Rediseño visual de la pantalla de Revisión — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. La pantalla `RevisionExpediente.jsx` (Admin, ruta `/revision/:id`)
ya funciona: muestra los 9 pasos con datos parseados (vía `revisionDisplay.js`), cajas de
observación por paso, subsanaciones del usuario con descarga, y las acciones Aprobar/Solicitar
subsanación. FUNCIONALMENTE está bien — el problema es visual: se ve genérica, con jerarquía plana
("CAMPO / valor paso 1" en tarjetas repetitivas), poco diferenciada del resto del sistema.

Componentes existentes: `RevisionExpediente.jsx`, `PasoCard.jsx`, `CampoPaso.jsx`, `AprobarModal.jsx`,
`revisionDisplay.js` (labels/humanización). Branding PRODHAB: navy #1B2A4A, dorado, ámbar para avisos.

## Alcance
Rediseño VISUAL de esta pantalla: colores, espaciado, jerarquía, tipografía, agrupación. NO cambiar
la lógica de datos (qué se muestra, de dónde viene, cómo se parsea `datosJson`), NO cambiar los
endpoints ni el comportamiento de Aprobar/Solicitar subsanación — solo cómo se ve.

Antes de tocar código, si el proyecto tiene una skill o guía de diseño frontend disponible, consultala
para mantener coherencia con el resto de la app.

---

## 1. Jerarquía visual general

Rediseñar la estructura de arriba hacia abajo para que un revisor de PRODHAB entienda de un vistazo
el estado del expediente:

- **Encabezado más prominente**: entidad, año, estado (badge grande y con color distintivo por
  estado), número de expediente, fecha de envío — con mejor jerarquía tipográfica (el nombre de la
  entidad como título principal, el resto como metadata secundaria). Considerar una barra de progreso
  o indicador de "pasos completos" similar al que usa el wizard, para dar contexto visual rápido.
- **Las tarjetas de paso (`PasoCard.jsx`)**: actualmente parecen todas iguales. Diferenciar visualmente
  los pasos que YA tienen observación (activa o de ronda anterior) de los que no — por ejemplo con un
  borde/acento ámbar en las que tienen observación, vs. un estilo neutro en las que no. Esto ayuda al
  Admin a ver de un vistazo qué pasos históricamente tuvieron problemas.
- **Los datos dentro de cada paso** (`CampoPaso.jsx`): mejorar el layout de pares etiqueta-valor
  (grid en vez de bloques apilados si hay espacio, tipografía más liviana para las etiquetas y más
  fuerte para los valores, mejor manejo visual de tablas/arrays anidados como inventario o riesgos —
  usar el estilo de tabla que ya exista en el proyecto en vez de un genérico).
- **La caja de observación**: darle más presencia visual cuando el paso YA tiene una observación
  activa (por ejemplo, un fondo o borde ámbar alrededor de todo el bloque paso+observación cuando hay
  algo pendiente), para que no se pierda entre el resto del contenido.

---

## 2. Barra de acciones (Aprobar / Solicitar subsanación)

Mejorar la presencia visual de la barra de acciones al final: que se sienta como el cierre claro de
la revisión (más padding, separación visual del resto, quizás sticky/fija al hacer scroll si el
proyecto ya usa ese patrón en otro lado — si no, no lo inventes de cero). Mantener los mismos dos
botones y su lógica exacta.

---

## 3. Subsanaciones del usuario

Si esa sección hoy es una lista plana, considerar un layout de tarjetas más claro: por cada
subsanación, su paso/campo, la justificación de texto, y el archivo con ícono de tipo (PDF/DOCX) +
botón de descarga, con mejor jerarquía que una tabla genérica.

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front (5173), abrir `/revision/:id` sobre un expediente con datos reales
  (crear uno completo si hace falta) y con al menos una observación de una ronda anterior, y
  verificar visualmente:
  1. El encabezado se ve claro y jerárquico.
  2. Los pasos con observación se distinguen de un vistazo de los que no.
  3. Los datos dentro de cada paso son legibles y bien organizados (no bloques de texto plano repetitivo).
  4. La barra de acciones se siente como el cierre de la pantalla.
  5. Aprobar y Solicitar subsanación siguen funcionando exactamente igual (mismos endpoints, mismos
     modales, mismo comportamiento — SOLO cambió la presentación).
- Reportar: qué archivos tocaste y un resumen de los cambios visuales (no hace falta describir cada
  clase de Tailwind, un resumen de las decisiones de diseño alcanza). Confirmar que ningún endpoint
  ni la lógica de aprobar/solicitar subsanación cambiaron.

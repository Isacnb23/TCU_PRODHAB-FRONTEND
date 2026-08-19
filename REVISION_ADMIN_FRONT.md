# Panel de revisión del Admin — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. Ya funciona todo el flujo del Usuario (login, Mis Expedientes,
crear/llenar/guardar por paso, retomar, enviar, solo lectura de enviados). react-router en uso.
`src/services/api.js` (fetch con token, `apiGet/apiPost/apiPut/apiDelete`, y `apiPostForm`).
`src/services/expedienteService.js` (listar, crear, obtener, enviar, guardarPaso).
`src/context/AuthContext.jsx` expone `user` (con `rol`) e `isAuthenticated`.
`ProtectedRoute` existente. Branding PRODHAB (navy #1B2A4A, dorado).

Backend (localhost:5004/api), YA implementado y probado:
- `GET  /api/expedientes?estado=Enviado` → lista filtrada (Admin ve todos).
- `GET  /api/expedientes/{id}` → detalle con `datos: [{ paso, datosJson, completado, ... }]` y
  `observaciones: [{ id, paso, texto, fechaCreacion }]`.
- `GET  /api/expedientes/{id}/subsanaciones` → `[{ id, paso, campo, textoJustificacion, tieneArchivo,
  archivoNombre, archivoMimeType, archivoExtension, archivoTamanoBytes, archivoHash, fechaSubsanacion }]`.
- `GET  /api/expedientes/{id}/subsanaciones/{sid}/archivo` → descarga el archivo (requiere Bearer).
- `POST /api/expedientes/{id}/solicitar-subsanacion` body `{ observaciones: [{ paso, texto }] }` → 200 (Admin only).
- `POST /api/expedientes/{id}/aprobar` body `{ numeroExpediente }` → 200 (Admin only). 409 si el número ya existe.

## Alcance
Construir el panel de revisión del Admin como PANTALLA APARTE (no reusar el wizard). Incluye: guard de
rol Admin, bandeja de revisión (lista de Enviados), y la pantalla de revisión de un expediente con
observaciones por paso, aprobar y solicitar subsanación. NO tocar el flujo del Usuario ya existente.
NO migrar librerías.

---

## 1. Servicios

En `src/services/expedienteService.js`, agregar:
- `listar(estado)` → si `estado` viene, `apiGet('/expedientes?estado=' + estado)`, si no `apiGet('/expedientes')`.
  (Ajustar el `listar()` existente para aceptar el parámetro opcional sin romper las llamadas actuales.)
- `solicitarSubsanacion(id, observaciones)` → `apiPost('/expedientes/' + id + '/solicitar-subsanacion', { observaciones })`
- `aprobar(id, numeroExpediente)` → `apiPost('/expedientes/' + id + '/aprobar', { numeroExpediente })`

Nuevo `src/services/subsanacionService.js`:
- `listarPorExpediente(expedienteId)` → `apiGet('/expedientes/' + expedienteId + '/subsanaciones')`
- `descargarArchivo(expedienteId, subsanacionId, nombreArchivo)`: como la descarga requiere el token
  Bearer, NO sirve un `<a href>` directo. Implementar con fetch autenticado: leer la respuesta como
  blob, crear un objectURL, disparar la descarga con `nombreArchivo`, y revocar el objectURL. Reutilizar
  la base URL y el token igual que api.js (podés exponer un helper en api.js tipo `apiGetBlob(path)` que
  haga el fetch con el header Authorization y devuelva el blob).

---

## 2. Guard de rol Admin

Crear `src/components/Auth/AdminRoute.jsx`: como `ProtectedRoute`, pero además exige `user.rol === 'Admin'`.
Si está autenticado pero NO es Admin → redirigir a `/expedientes` (no puede revisar). Si no está
autenticado → a `/login`.

En la navegación (Header o Sidebar donde estén los links), mostrar un link **"Revisión"** hacia
`/revision` SOLO si `user.rol === 'Admin'`.

---

## 3. Rutas nuevas (protegidas por AdminRoute)

- `/revision` → `RevisionBandeja` (lista de expedientes a revisar).
- `/revision/:id` → `RevisionExpediente` (pantalla de revisión de uno).

---

## 4. Bandeja de revisión — `src/components/Revision/RevisionBandeja.jsx`

- Al montar: `expedienteService.listar('Enviado')` → los que esperan revisión.
- Tabla/lista con: entidad, año, estado, fecha de envío, y un botón/clic "Revisar" → `/revision/:id`.
- Estado vacío amable ("No hay expedientes pendientes de revisión.").
- Opcional: un pequeño selector de estado para ver también Aprobados / RequiereSubsanacion
  (llamando listar con ese estado). Si agregás complejidad, dejalo solo en "Enviado" por ahora.
- Estilo PRODHAB coherente. Título "Bandeja de Revisión".

---

## 5. Pantalla de revisión — `src/components/Revision/RevisionExpediente.jsx`

Al montar (con `:id`): `expedienteService.obtener(id)` y `subsanacionService.listarPorExpediente(id)`.
Estados de carga/error. Layout pensado para LEER y DECIDIR (no es el wizard):

**Encabezado:** entidad, año, estado (badge), número de expediente (o "Sin asignar"), fecha de envío.

**Los 9 pasos, en tarjetas legibles (solo lectura):** por cada paso (1..9), una tarjeta con:
- Título del paso (General, Inventario, Amenazas, Finalidad, Transferencia, Riesgos, Seguridad,
  Adicionales, Revisión).
- El contenido de ese paso renderizado LEGIBLE (parsear el `datosJson` correspondiente y mostrar los
  campos como pares etiqueta→valor, no JSON crudo). Para las etiquetas, reutilizá lo que exista en el
  repo (formSchema.json o los labels de los componentes Step). Si no hay labels fácilmente
  disponibles, humanizá las claves (ej. "nombreBaseDatos" → "Nombre Base de Datos") y mostralas
  ordenadas. El objetivo: que un revisor de PRODHAB lo lea cómodo. Manejar campos vacíos/colecciones
  (ej. inventario, riesgos como filas) de forma razonable (lista/tabla).
- **Caja de observación por paso:** un textarea "Observación para este paso (opcional)". Lo que el
  Admin escriba acá se recolecta para "Solicitar subsanación".
- Si el paso ya tenía observaciones previas (de `expediente.observaciones` con ese `paso`), mostrarlas
  arriba de la caja como historial ("Observación anterior: …", con su fecha), en solo lectura.

**Subsanaciones del usuario (si hay):** una sección que liste las subsanaciones traídas, agrupadas por
paso o en una tabla: paso, campo, justificación, y si `tieneArchivo`, un botón "Descargar" que llama
`subsanacionService.descargarArchivo(id, sid, archivoNombre)`. Así el Admin ve cómo respondió el usuario.

**Barra de acciones** (solo si `estado === 'Enviado'`; si no, mostrar el estado y deshabilitar):
- **"Aprobar":** abre un modal (consistente con NuevoExpedienteModal) que pide "Número de expediente"
  (placeholder "001-01-2026-INS", requerido). Al confirmar → `expedienteService.aprobar(id, numero)`.
  Éxito → mensaje y volver a `/revision`. Error 409 (número duplicado) → mostrar el mensaje del backend
  en el modal sin cerrarlo.
- **"Solicitar subsanación":** recolectar todas las observaciones NO vacías de las cajas por paso →
  `[{ paso, texto }]`. Si no hay ninguna → deshabilitar el botón (o avisar "Escribe al menos una
  observación"). Al confirmar (puede ir con una confirmación breve) → `expedienteService.solicitarSubsanacion(id, observaciones)`.
  Éxito → mensaje y volver a `/revision`. Error → banner no intrusivo.

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front (5173) corriendo, probar el flujo REAL:
  1. Login como Admin (dev@prodhab.local / dev123). Aparece el link "Revisión" en la navegación.
  2. Ir a `/revision` → se ven los expedientes en estado Enviado (usar alguno de los enviados que ya
     existen, ej. 3008/3009, o crear y enviar uno nuevo).
  3. Abrir uno → se ven los 9 pasos con sus datos legibles (no JSON crudo), y las cajas de observación.
  4. Escribir observaciones en el paso 3 y el paso 5 → "Solicitar subsanación" → 200 → vuelve a la
     bandeja; ese expediente ya NO está en la lista de Enviado (pasó a RequiereSubsanacion).
  5. Abrir otro Enviado → "Aprobar" → modal → número "001-01-2026-INS" → 200 → vuelve a la bandeja.
     Probar aprobar con un número ya usado → 409 mostrado en el modal.
  6. Como usuario NO admin (crear/login uno normal): intentar entrar a `/revision` → redirige a
     `/expedientes`. El link "Revisión" NO aparece para ese usuario.
  7. Si el expediente tiene subsanaciones con archivo, probar el botón "Descargar" → baja el archivo
     con su nombre original.
- Reportar: archivos nuevos, cómo resolviste el renderizado legible de los datos por paso (labels vs
  humanización de claves), y el resultado del flujo — sobre todo el punto 4 (solicitar subsanación) y
  el 5 (aprobar con número). Confirmar que el flujo del Usuario no cambió.

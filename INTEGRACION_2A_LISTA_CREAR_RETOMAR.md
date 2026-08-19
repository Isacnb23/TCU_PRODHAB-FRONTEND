# Integración Front ↔ Backend — Parte 2a: Lista de expedientes, crear y retomar

Frontend `prodhab-protocolos` (React + Vite + react-router-dom + Tailwind). Ya tiene, de la Parte 1:
- `src/services/api.js` (fetch wrapper con token, manejo 401/errores, y `apiPostForm` preparado).
- `src/services/authService.js`, `src/context/AuthContext.jsx`, login funcionando.
- Wizard de 9 pasos: estado en `useState` de `App.jsx` (`formData`, `currentStep`), persistencia en
  localStorage (`prodhab_formData`, `prodhab_currentStep`). Pasos en `src/components/Forms/Step1..Step9`.
  Esquema de campos por paso en `src/data/formSchema.json`.

Backend (localhost:5004/api, ajustar si cambia). Endpoints de esta parte:
- `POST /api/expedientes`         body `{ entidad, anio }` → 201 `{ id, numeroExpediente, entidad, anio, estado, pasoActual, fechaCreacion, fechaModificacion, fechaEnvio, datos: [] }`
- `GET  /api/expedientes`         → 200 `[{ id, numeroExpediente, entidad, anio, estado, pasoActual, fechaCreacion, fechaModificacion }]` (el backend ya filtra: Usuario ve los suyos, Admin todos)
- `GET  /api/expedientes/{id}`    → 200 detalle con `datos: [{ paso, datosJson, completado, fechaActualizacion }]`
Todos requieren Bearer token (ya lo inyecta api.js).

## Alcance de ESTA parte (2a)
Montar la lista "Mis Expedientes", la creación de borrador y el retomar con rehidratación.
NO enganchar todavía el guardado de cada paso al dar "Siguiente" (eso es la Parte 2b).
NO migrar a zustand/react-hook-form/zod. Mantener el `useState` + localStorage del wizard.

Reglas: cambios mínimos, no romper el wizard existente.

---

## 1. Servicio de expedientes — `src/services/expedienteService.js`

- `listar()` → `apiGet('/expedientes')`
- `crear({ entidad, anio })` → `apiPost('/expedientes', { entidad, anio })`
- `obtener(id)` → `apiGet('/expedientes/' + id)`
(El guardado de paso `guardarPaso` se agrega en la Parte 2b — no lo incluyas ahora.)

---

## 2. Mapeo formData ↔ JSON por paso — `src/utils/pasoMapper.js`

Esta es la lógica CLAVE que comparten rehidratar (2a) y guardar (2b). Primero INSPECCIONÁ
`src/data/formSchema.json` y los componentes `Step1..Step9` para entender qué campos de `formData`
pertenecen a cada paso. Luego definí DOS funciones puras:

- `extraerDatosPaso(formData, paso)` → devuelve un objeto SOLO con los campos que corresponden a ese
  paso (según formSchema.json). Este objeto es lo que luego se serializa a `datosJson`.
- `fusionarDatosPaso(formData, paso, datosPaso)` → devuelve un NUEVO formData con los campos de ese
  paso sobrescritos por `datosPaso` (objeto ya parseado del `datosJson` guardado). Inmutable
  (no mutar el formData original).

Si el formSchema.json define claramente los campos por paso, usalo como fuente de verdad para el
agrupamiento. Si la estructura de formData no permite un slice limpio por paso, elegí la estrategia
más robusta y documentala con un comentario. Al terminar, REPORTAME qué mapeo derivaste (qué campos
caen en qué paso), porque de eso depende que el guardado de la Parte 2b sea correcto.

---

## 3. Ruteo y aterrizaje post-login

Reorganizar las rutas (react-router):
- `/login` → Login (ya existe).
- `/expedientes` → nueva pantalla `MisExpedientes` (protegida).
- `/expedientes/:id` → el wizard (protegido), operando sobre ese expediente.
- `/` → redirige a `/expedientes`.

Cambiar el destino post-login: en `Login.jsx`, tras login exitoso, navegar a `/expedientes`
(en vez de `/`).

Todas las rutas protegidas siguen envueltas por el `ProtectedRoute` existente.

---

## 4. Pantalla "Mis Expedientes" — `src/components/Expedientes/MisExpedientes.jsx`

- Al montar: `expedienteService.listar()`. Estados de carga y error (mostrar mensaje si falla, no romper).
- Render: título "Mis Expedientes", un botón destacado "Nuevo Expediente", y la lista/tabla de
  expedientes. Por cada uno mostrar: entidad, año, número de expediente (o "Sin asignar" si null),
  un badge de estado (Borrador/Enviado/EnRevision/RequiereSubsanacion/Aprobado con colores), el paso
  actual ("Paso X de 9"), y fecha de última modificación. Estilo Tailwind con branding PRODHAB
  (navy #1B2A4A, dorado) coherente con el login y el wizard.
- Si la lista está vacía: estado vacío amable ("Aún no tienes expedientes. Crea el primero.").
- Clic en un expediente → `navigate('/expedientes/' + id)` (lo retoma en el wizard).

**Modal "Nuevo Expediente"** (`src/components/Expedientes/NuevoExpedienteModal.jsx` o inline):
- Campos: "Nombre de la entidad" (texto, requerido, máx 300) y "Año" (número, default = año actual).
- Botón "Crear y continuar": llama `expedienteService.crear({ entidad, anio })`, y con el `id`
  devuelto hace `navigate('/expedientes/' + id)`. Manejo de error visible si falla.
- Botón "Cancelar" cierra el modal sin crear nada (importante: el borrador se crea SOLO al confirmar).

---

## 5. Entrada al wizard por id + rehidratación

El wizard ahora vive en `/expedientes/:id`. Adaptar el punto donde se monta el wizard (App.jsx o
extraer a un `WizardPage.jsx` que lea el `:id` con `useParams`):

Al montar con un `id`:
1. `expedienteService.obtener(id)` para traer el detalle (incluye `datos[]` y `pasoActual`).
2. Reconstruir el `formData` del wizard: partir del formData inicial vacío y, por cada entrada de
   `datos`, hacer `formData = fusionarDatosPaso(formData, entrada.paso, JSON.parse(entrada.datosJson))`.
   Además, reflejar `entidad`/`anio` del expediente en los campos correspondientes del paso 1 si aplica.
3. Setear `currentStep = expediente.pasoActual` (retomar donde quedó). Si es un borrador nuevo sin
   datos, arrancar en paso 1.
4. Guardar el `id` del expediente actual en el estado del wizard (lo va a necesitar la Parte 2b para
   saber a qué expediente guardar). Exponerlo por ejemplo como `expedienteId` en el estado de App.

**localStorage por expediente (importante):** hoy las claves son globales
(`prodhab_formData`), lo que mezclaría datos entre distintos expedientes. Cambiar el respaldo de
localStorage para que sea POR expediente: usar claves como `prodhab_formData_{id}` y
`prodhab_currentStep_{id}`. Al montar el wizard con un id, cargar el respaldo de ESE id (pero los
datos del backend tienen prioridad sobre el localStorage si ambos existen). Migrar/limpiar las
claves globales viejas para que no interfieran.

Manejo de errores: si `obtener(id)` da 404 (expediente inexistente) o 403 (ajeno), redirigir a
`/expedientes` con un mensaje ("No se encontró el expediente" / "No tienes acceso").

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front corriendo, probar el flujo REAL:
  1. Login → aterriza en `/expedientes` (Mis Expedientes), no en el wizard directo.
  2. Lista vacía muestra el estado vacío (si es primer uso).
  3. "Nuevo Expediente" → modal → entidad "Ministerio de Prueba" + año → "Crear y continuar" →
     crea el borrador (verificar 201 en Network) y entra al wizard en paso 1. El expedienteId quedó
     en el estado.
  4. Volver a `/expedientes` → el nuevo borrador aparece en la lista con estado "Borrador", "Paso 1 de 9".
  5. (Sin Parte 2b aún, los pasos no se guardan al backend todavía — eso es lo siguiente. Pero la
     creación y el listado sí deben funcionar.)
  6. Clic en el borrador de la lista → entra al wizard sobre ese id (GET /expedientes/{id} en Network).
  7. Crear un segundo expediente distinto → ambos aparecen en la lista, separados.
- Reportar: archivos nuevos, el MAPEO derivado en pasoMapper.js (qué campos por paso), si extrajiste
  el wizard a WizardPage o quedó en App.jsx, y el resultado del flujo. Confirmar que el wizard sigue
  funcionando (los 9 pasos, validaciones) una vez adentro.

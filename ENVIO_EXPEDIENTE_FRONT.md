# Envío final del expediente — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. Ya funciona todo el flujo (Partes 1, 2a, 2b):
login, Mis Expedientes, crear/retomar, y guardado de cada paso al dar "Siguiente" (upsert al backend
+ respaldo localStorage). El wizard vive en `/expedientes/:id` (WizardPage.jsx → WizardContainer.jsx),
con `expedienteId` como prop y rehidratación desde el backend. Pasos en `src/components/Forms/Step1..Step9`.
El paso 9 es `Step9_Revision.jsx` (revisión final; ya tiene un botón "Descargar Excel").

Backend (localhost:5004/api). Endpoint nuevo, YA implementado y probado:
- `POST /api/expedientes/{id}/enviar` → 200 con el ExpedienteDetalleDto actualizado (estado="Enviado").
  Si faltan pasos requeridos (1..8 completados) → 409 con detalle "Faltan completar los pasos: X, Y".
  Si el expediente no está en Borrador/RequiereSubsanacion → 409. Si es ajeno → 403.

## Alcance
Dos cosas: (1) el botón "Enviar a PRODHAB" en el paso 9, y (2) modo SOLO LECTURA cuando el
expediente ya no es Borrador. NADA más. NO migrar librerías. No tocar la lógica de guardado por paso
ni la rehidratación (ya funcionan). Cambios concentrados en pocos archivos.

---

## 1. Servicio — agregar a `src/services/expedienteService.js`
```
enviar(expedienteId) => apiPost(`/expedientes/${expedienteId}/enviar`)
```

---

## 2. Modo solo lectura (expediente ya enviado)

En `WizardPage.jsx` ya se carga el expediente (tiene `estado`). Derivar:
```
const esEditable = expediente.estado === 'Borrador';
```
Pasar `readOnly={!esEditable}` como prop a `WizardContainer`.

En `WizardContainer.jsx`:
- **Envolver el contenido del paso actual en un `<fieldset disabled={readOnly}>`** (sin borde/estilo
  propio: `className="border-0 p-0 m-0 min-w-0"`). Un fieldset deshabilitado desactiva NATIVAMENTE
  todos los inputs/selects/textareas/botones internos, sin tener que tocar los 9 componentes Step.
  Los botones de navegación (Anterior/Siguiente) deben quedar FUERA de ese fieldset para poder seguir
  navegando en modo lectura.
- En `handleNext`: si `readOnly`, NO llamar a `guardarPaso` — solo navegar al siguiente paso
  (permitir recorrer los pasos para consultar, sin guardar nada).
- Mostrar un **banner de solo lectura** arriba del wizard cuando `readOnly`, ej. estilo informativo
  (azul/navy): "Este expediente ya fue enviado a PRODHAB. Está en modo solo lectura."
  Si el estado no es Borrador ni Enviado (ej. EnRevision, RequiereSubsanacion, Aprobado), el banner
  puede reflejar el estado real ("Estado: {estado}. Solo lectura."). Usá el estado del expediente.

---

## 3. Botón "Enviar a PRODHAB" en el paso 9

La lógica de envío vive en `WizardContainer` (tiene `expedienteId`, `formData`, y useNavigate).
Definir ahí un handler `handleEnviar` y pasar a `Step9_Revision` estas props:
`onEnviar` (el handler), `puedeEnviar` (bool de completitud), y `readOnly`.

**Completitud (`puedeEnviar`)**: reutilizar la lógica de completado que YA alimenta los chips
"Completados X / Falta Y" del wizard. `puedeEnviar` = los pasos requeridos (1 a 8) están todos
completos. No inventar una nueva noción de completitud si ya existe una; reusala.

**En `Step9_Revision.jsx`**: agregar un botón "Enviar a PRODHAB" (junto al de Descargar Excel).
- Si `readOnly` (ya enviado): NO mostrar el botón de enviar (o mostrarlo deshabilitado con leyenda
  "Expediente ya enviado").
- Si `!puedeEnviar`: botón deshabilitado + texto de ayuda ("Completa todos los pasos obligatorios
  para poder enviar.").
- Si `puedeEnviar` y editable: botón activo.

**`handleEnviar`** (en WizardContainer):
1. Confirmación previa (modal consistente con `NuevoExpedienteModal`, o un window.confirm como
   fallback aceptable): "¿Enviar el expediente a PRODHAB? Una vez enviado no podrás editarlo."
2. Si confirma: mostrar estado "Enviando…" (deshabilitar el botón), llamar `expedienteService.enviar(expedienteId)`.
3. Éxito → mensaje de éxito ("Expediente enviado correctamente a PRODHAB.") y navegar a `/expedientes`
   (la lista, donde ahora aparece como "Enviado").
4. Error 409 (faltan pasos u otro conflicto): mostrar el mensaje `detail` del backend de forma
   visible y NO intrusiva (ej. banner ámbar), sin romper la pantalla. NO navegar.
5. Otro error: mensaje genérico ("No se pudo enviar. Intenta de nuevo."). Loguear en consola.

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front (5173) corriendo, probar el flujo REAL:
  1. Crear un expediente nuevo y NO completar todos los pasos. Ir al paso 9 → el botón "Enviar a
     PRODHAB" está deshabilitado con el texto de ayuda.
  2. Completar los pasos 1 a 8 (Siguiente en cada uno). Ir al paso 9 → el botón se habilita.
  3. Clic en "Enviar a PRODHAB" → aparece la confirmación → confirmar → POST /enviar → 200 →
     mensaje de éxito → vuelve a /expedientes y el expediente figura como "Enviado".
  4. Abrir ese expediente enviado desde la lista → el wizard se muestra en SOLO LECTURA: banner
     visible, todos los campos deshabilitados (no se pueden editar), se puede navegar entre pasos
     para consultar, y el botón de enviar ya no aparece (o está deshabilitado).
  5. (Opcional) Forzar el caso 409: crear otro expediente, saltar al paso 9 por el sidebar sin
     completar pasos intermedios, e intentar enviar (si el botón lo permite) → debe mostrar el
     mensaje de "Faltan completar los pasos: ..." sin romperse.
- Reportar: qué archivos tocaste, cómo resolviste `puedeEnviar` (qué lógica de completitud reusaste),
  y el resultado del flujo — sobre todo el punto 3 (envío exitoso) y el 4 (solo lectura). Confirmar
  que el guardado por paso y la rehidratación siguen intactos para los borradores editables.

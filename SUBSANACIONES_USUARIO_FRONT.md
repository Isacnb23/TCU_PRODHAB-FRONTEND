# Subsanaciones del Usuario — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. Funciona todo: login, Mis Expedientes, wizard (crear/llenar/guardar por
paso/retomar/enviar), solo lectura de enviados, y el panel de revisión del Admin (bandeja, aprobar,
solicitar subsanación con observaciones por paso). El wizard vive en `/expedientes/:id`
(WizardPage.jsx → WizardContainer.jsx). Pasos en `src/components/Forms/Step1..Step9`. Existe
`src/components/Forms/FileUpload.jsx` (componente de carga de archivo — reusar si aplica).
`src/services/subsanacionService.js` (listarPorExpediente, descargarArchivo). `api.js` con
`apiPostForm(path, formData)` para multipart. `src/utils/revisionDisplay.js` con los títulos de los 9 pasos.

Backend (localhost:5004/api), YA implementado:
- Editar pasos en estado `RequiereSubsanacion` YA está permitido (PUT /pasos/{n} responde 200).
- Reenvío: `POST /expedientes/{id}/enviar` YA permite enviar desde `RequiereSubsanacion` → vuelve a Enviado.
- El detalle `GET /expedientes/{id}` trae `observaciones: [{ id, paso, texto, fechaCreacion }]`.
- Crear subsanación (multipart): `POST /api/expedientes/{id}/subsanaciones` con campos de formulario
  `Paso`, `Campo`, `TextoJustificacion` (opcional), `Archivo` (opcional). Requiere al menos texto O archivo.
  Valida el archivo por contenido (PDF/DOCX). → 201 con la subsanación creada.
- Listar/descargar subsanaciones ya existen en subsanacionService.
- (Opcional) Eliminar: `DELETE /api/expedientes/{id}/subsanaciones/{sid}` → 204 (salvo Aprobado).

## Alcance
Cerrar el loop de subsanación del lado del Usuario: hacer el wizard editable en `RequiereSubsanacion`,
mostrar las observaciones del Admin (resumen + banner por paso), permitir adjuntar subsanaciones por
paso observado, y reenviar. NO tocar el flujo del Admin ni el de creación normal. NO migrar librerías.

---

## 1. Hacer el wizard editable en RequiereSubsanacion

En `WizardPage.jsx` (hoy: `readOnly={estado !== 'Borrador'}`) y donde corresponda:
```
const esEditable = estado === 'Borrador' || estado === 'RequiereSubsanacion';
```
Pasar `readOnly={!esEditable}` a WizardContainer. Así los estados Enviado/EnRevision/Aprobado siguen
en solo lectura (como hoy), pero RequiereSubsanacion pasa a editable.

Además, en `WizardPage.jsx`:
- Ya se obtiene el detalle (tiene `observaciones` y `estado`). Pasar `observaciones` y `estado` a
  WizardContainer.
- Obtener también las subsanaciones existentes: `subsanacionService.listarPorExpediente(id)` y pasarlas
  a WizardContainer (para mostrar las ya adjuntadas y refrescar tras agregar una).

---

## 2. Servicio — agregar a `src/services/subsanacionService.js`

```
crear(expedienteId, { paso, campo, textoJustificacion, archivo }) {
    const fd = new FormData();
    fd.append('Paso', paso);
    fd.append('Campo', campo);
    if (textoJustificacion) fd.append('TextoJustificacion', textoJustificacion);
    if (archivo) fd.append('Archivo', archivo);
    return apiPostForm(`/expedientes/${expedienteId}/subsanaciones`, fd);
}
// opcional:
eliminar(expedienteId, subsanacionId) => apiDelete(`/expedientes/${expedienteId}/subsanaciones/${subsanacionId}`)
```
(apiPostForm NO debe setear Content-Type manual: el browser pone el boundary del multipart.)

---

## 3. Resumen de observaciones al entrar (solo si estado === RequiereSubsanacion)

En `WizardContainer.jsx`, arriba del wizard, un panel destacado (estilo aviso ámbar/dorado, coherente
con PRODHAB) que aparece SOLO cuando el estado es RequiereSubsanacion:
- Título: "Este expediente requiere subsanación".
- Lista de las observaciones agrupadas por paso: "Paso {N} — {título del paso}: {texto}" (usar los
  títulos de revisionDisplay.js). Cada una con un botón "Ir al paso" que hace `setCurrentStep(paso)`.
- Puede ser colapsable, pero visible al entrar.

---

## 4. Banner de observación por paso

En el paso actual, si hay una o más observaciones para `currentStep` (filtrar `observaciones` por
`paso === currentStep`), mostrar un banner ámbar ARRIBA del contenido del paso con el/los texto(s) de
la observación y su fecha. Este banner se muestra tanto en RequiereSubsanacion como si el usuario
navega por los pasos (para tener el contexto visible mientras corrige).

---

## 5. Área de subsanación por paso observado (solo si estado === RequiereSubsanacion)

En los pasos que tienen observación, DEBAJO del contenido del paso (dentro del área editable), una
sección "Subsanación de este paso":
- **Lista de subsanaciones ya adjuntadas** para este paso (filtrar las subsanaciones por `paso`):
  mostrar justificación, y si `tieneArchivo`, el nombre y un botón "Descargar"
  (`subsanacionService.descargarArchivo`). Si incluís eliminar, un botón "Eliminar" que llama
  `subsanacionService.eliminar` y refresca.
- **Formulario para adjuntar una nueva subsanación:**
  - Textarea "Justificación" (opcional).
  - Selector de archivo (reusar FileUpload.jsx si encaja; si no, un input file simple). Aceptar solo
    PDF/DOCX en el `accept` (el backend igual valida por contenido).
  - Botón "Adjuntar subsanación": deshabilitado si NO hay ni texto ni archivo (espejo de la regla del
    backend). Al enviar → `subsanacionService.crear(id, { paso: currentStep, campo, textoJustificacion, archivo })`
    donde `campo` = el título del paso (de revisionDisplay.js). Estado "Adjuntando…". Éxito → limpiar
    el form, refrescar la lista de subsanaciones (volver a llamar listarPorExpediente o agregar la
    devuelta). Error → mostrar el mensaje del backend (ej. archivo inválido) de forma no intrusiva,
    sin romper.

---

## 6. Reenvío desde RequiereSubsanacion

El botón de envío del paso 9 (`handleEnviar` en WizardContainer, "Enviar a PRODHAB") YA llama a
`POST /enviar`, que el backend permite desde RequiereSubsanacion. Ajustes:
- Como ahora el wizard es editable en RequiereSubsanacion, el botón del paso 9 debe aparecer (ya no
  está en readOnly). Verificar que se muestre.
- Cambiar el label a "Reenviar a PRODHAB" cuando `estado === 'RequiereSubsanacion'` (si es Borrador,
  sigue "Enviar a PRODHAB").
- El texto de confirmación puede aclarar: "¿Reenviar el expediente subsanado a PRODHAB?".
- Al reenviar con éxito → vuelve a `/expedientes` (el expediente figura como Enviado de nuevo).

(No exigir que todas las observaciones tengan subsanación para reenviar — el Admin re-revisa. Si
querés, un aviso suave "tienes observaciones sin subsanar, ¿reenviar igual?" es opcional.)

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front (5173), probar el LOOP COMPLETO de punta a punta:
  1. Como Usuario: crear expediente, completar pasos 1-8, enviar → Enviado.
  2. Como Admin: en /revision, abrir ese expediente, escribir observaciones en pasos 3 y 5, "Solicitar
     subsanación" → RequiereSubsanacion.
  3. Como el Usuario dueño: abrir ese expediente desde Mis Expedientes → el wizard ahora es EDITABLE,
     aparece el resumen de observaciones arriba, y al ir al paso 3 y 5 se ve el banner de observación.
  4. En el paso 3: editar un campo (dar Siguiente guarda vía PUT /pasos/3 → 200) y adjuntar una
     subsanación con un PDF real + justificación → 201, aparece en la lista de subsanaciones del paso.
  5. Probar adjuntar un archivo inválido (un .txt renombrado a .pdf) → error legible, no rompe.
  6. Ir al paso 9 → botón "Reenviar a PRODHAB" → confirmar → 200 → vuelve a Mis Expedientes como Enviado.
  7. Como Admin: reabrir en /revision → ver los datos corregidos, las observaciones anteriores, y en
     "Subsanaciones del usuario" el archivo adjuntado (descargable). Aprobar con número → Aprobado.
  8. Como Usuario: abrir el Aprobado → solo lectura (no editable), sin área de subsanación.
- Reportar: archivos tocados, si reusaste FileUpload.jsx o hiciste input propio, y el resultado del
  LOOP completo (sobre todo el punto 4: editar + adjuntar en RequiereSubsanacion, y el 6: reenvío).
  Confirmar que crear/enviar normal (Borrador) y el panel del Admin siguen intactos.

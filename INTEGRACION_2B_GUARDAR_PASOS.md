# Integración Front ↔ Backend — Parte 2b: Guardar cada paso al dar "Siguiente"

Frontend `prodhab-protocolos`. Ya funciona (Partes 1 y 2a):
- Login JWT, `api.js`, `authService`, `AuthContext`.
- `src/services/expedienteService.js` (listar, crear, obtener).
- `src/utils/pasoMapper.js` con el mapeo YA correcto:
  paso N ↔ clave `formData`: 1=step1_general, 2=step2_inventario, 3=step3_amenazas,
  4=step4_finalidad, 5=step5_transferencia, 6=step6_riesgos, 7=step7_seguridad,
  8=step8_adicionales, 9=step9_revision.
  Funciones `extraerDatosPaso(formData, paso)` y `fusionarDatosPaso(formData, paso, datosPaso)`.
- `src/pages/WizardPage.jsx`: wizard en `/expedientes/:id`, con el `expedienteId` en su estado,
  rehidratación desde el backend al montar, y respaldo en localStorage por expediente.
- Mis Expedientes, crear borrador, retomar por id — todo probado contra el backend real.

Backend (localhost:5004/api). Endpoint de esta parte:
- `PUT /api/expedientes/{expedienteId}/pasos/{paso}`
  body `{ datosJson: "<string JSON>", completado: <bool> }` → 200 `{ paso, datosJson, completado, fechaActualizacion }`
  (El backend hace upsert: una fila por paso. Avanza el pasoActual del expediente automáticamente.
   `datosJson` es un STRING que contiene JSON — hay que mandar `JSON.stringify(objeto)`, no el objeto.)

## Alcance de ESTA parte (2b)
Enganchar el guardado de cada paso al backend cuando el usuario da "Siguiente", con respaldo en
localStorage y manejo de error que no bloquee al usuario. NADA más. NO tocar la lógica de validación
del wizard, ni la rehidratación (ya funciona), ni el mapeo. NO migrar librerías.

Regla: cambios mínimos, quirúrgicos, sobre el flujo de navegación del wizard.

---

## 1. Agregar `guardarPaso` al servicio — `src/services/expedienteService.js`

```
guardarPaso(expedienteId, paso, datosPaso, completado) =>
    apiPut(`/expedientes/${expedienteId}/pasos/${paso}`, {
        datosJson: JSON.stringify(datosPaso),
        completado
    })
```
Donde `datosPaso` es el OBJETO del paso (el resultado de `extraerDatosPaso`). El stringify pasa acá.

---

## 2. Enganchar el guardado en el "Siguiente" del wizard

Ubicar dónde se maneja el avance de paso (el botón "Siguiente" — probablemente en
`NavigationButtons.jsx`, `WizardContainer.jsx` o `WizardPage.jsx`). El guardado debe ocurrir en el
handler de avanzar, con estas reglas EXACTAS:

1. **Solo guardar si la validación del paso actual pasa.** El wizard ya valida por paso antes de
   permitir avanzar (existe esa lógica). El guardado va DESPUÉS de que la validación pasó y ANTES (o
   en paralelo) de cambiar de paso. Si la validación falla, NO se guarda ni se avanza (comportamiento
   actual intacto).

2. Al avanzar del paso N:
   - `const datosPaso = extraerDatosPaso(formData, N)`
   - `const completado = true` (si pasó la validación, el paso está completo)
   - `await expedienteService.guardarPaso(expedienteId, N, datosPaso, completado)`
   - Mantener SIEMPRE el respaldo en localStorage (ya existe) — no quitarlo.

3. **Estado de guardado (UX):** mientras el PUT está en vuelo, mostrar un indicador sutil en el botón
   "Siguiente" (ej. deshabilitarlo con texto "Guardando…"). Al completar, avanzar de paso. Que no se
   pueda dar doble clic y mandar dos PUT.

4. **Manejo de error SIN bloquear al usuario:** si el PUT falla (red caída, backend abajo), NO
   impedir que el usuario avance — sus datos están a salvo en localStorage. Mostrar un aviso NO
   intrusivo (un toast/banner tipo "No se pudo guardar en el servidor, pero tus datos están
   guardados localmente. Se reintentará.") y permitir continuar. Registrar el error en consola.
   Lo importante: NUNCA perder datos del usuario ni trabarlo por un fallo de red.

5. **El paso 9 (Revisión)** normalmente no tiene "Siguiente" sino un envío final. Por ahora NO
   implementar el envío del expediente (cambio de estado a Enviado) — eso es un paso posterior.
   Si el paso 9 tiene botón de avanzar, tratalo igual que los demás (guardar su JSON). Si es un
   botón de "Finalizar/Enviar", dejalo como está por ahora (no lo conectes al backend en esta parte).

---

## 3. Guardado también al navegar hacia atrás (opcional pero recomendado)

Si el usuario puede saltar entre pasos con el Sidebar (parece que sí, por StepIndicator/Sidebar),
considerá guardar el paso actual también al salir de él hacia otro paso vía el sidebar, con la misma
lógica tolerante a fallos. Si esto agrega complejidad o riesgo, priorizá SOLO el "Siguiente" y dejá
el guardado por sidebar como mejora posterior — no es crítico para la demo. Usá tu criterio y
reportá qué decidiste.

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front (5173) corriendo, probar el flujo REAL end-to-end:
  1. Login → Mis Expedientes → "Nuevo Expediente" (entidad + año) → entra al wizard.
  2. Llenar el paso 1 completo (todos los campos obligatorios) → "Siguiente".
     Confirmar en Network un **PUT /expedientes/{id}/pasos/1 → 200**.
  3. Llenar y avanzar por varios pasos (2, 3, 4…), cada uno disparando su PUT correspondiente.
  4. **La prueba clave — persistencia real:** volver a `/expedientes`, y volver a ENTRAR al mismo
     borrador. El wizard debe **rehidratar los datos** que se guardaron (el paso 1, 2, 3… ya no
     están vacíos) y saltar al pasoActual donde quedó. Esto cierra el ciclo guardar→retomar.
  5. Recargar la página (F5) estando en el wizard → los datos siguen (localStorage + backend).
  6. Probar el manejo de error: bajar el backend (Ctrl+C en su terminal), dar "Siguiente" en un
     paso → debe mostrar el aviso no intrusivo y DEJAR avanzar igual (datos en localStorage). Volver
     a subir el backend.
  7. En SQL/Thunder Client, confirmar que en la tabla DatosFormularios hay UNA fila por paso guardado
     (no duplicados) para ese expediente.
- Reportar: qué archivo/handler modificaste para enganchar el guardado, si implementaste el guardado
  por sidebar o solo por "Siguiente", y el resultado del flujo — sobre todo el punto 4 (rehidratación
  real tras guardar). Confirmar que la validación por paso y el resto del wizard siguen intactos.

# Ampliar Paso 4 (Finalidad) — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. `Step4_Finalidad.jsx` hoy captura: `finalidad` (texto), `baseLegal`
(select), y `datosRecopilados` (array de filas: `nombre`, `tipo`, `obligatorio`).

Backend: SIN CAMBIOS NECESARIOS — `DatosFormulario.DatosJson` es JSON libre, el backend no valida
su forma interna. Esto es trabajo 100% de frontend.

## Objetivo
Agregar los campos que pide la plantilla oficial de PRODHAB (hoja FINALIDAD y hoja DATOS) que hoy
faltan, SIN romper los datos ya guardados de expedientes existentes (los campos nuevos deben tener
default seguro si no existen en un `datosJson` viejo).

---

## 1. Campos nuevos a nivel del paso (junto a `finalidad`/`baseLegal`)

- `excepciones` — texto libre, opcional. Label: "Excepciones aplicables"
- `requiereConsentimiento` — SÍ/NO (boolean o select), opcional. Label: "¿Requiere consentimiento del titular?"
- `poblacionInterviniente` — texto libre, opcional. Label: "Población interviniente"
- `cantidadAproxPersonas` — número, opcional. Label: "Cantidad aproximada de personas"
- `partesInteresadasInternas` — texto libre, opcional. Label: "Partes interesadas internas"
- `anonimizacion` — SÍ/NO, opcional. Label: "¿Se aplica anonimización?"
- `observacionesFinalidad` — texto libre, opcional. Label: "Observaciones"

## 2. Columnas nuevas por cada fila de `datosRecopilados`

Cada fila ya tiene `nombre`, `tipo`, `obligatorio`. Agregar:
- `fuente` — texto libre, opcional. Label: "Fuente del dato"
- `uso` — texto libre, opcional. Label: "Uso"
- `personasMenores` — SÍ/NO, opcional. Label: "¿Involucra personas menores de edad?"
- `personasDiscapacidad` — SÍ/NO, opcional. Label: "¿Involucra personas con discapacidad?"
- `personasFuncionarias` — SÍ/NO, opcional. Label: "¿Involucra personas funcionarias?"
- `personasVulnerables` — SÍ/NO, opcional. Label: "¿Involucra personas en estado de vulnerabilidad?"
- `vigencia` — texto libre, opcional. Label: "Vigencia"

## 3. Compatibilidad hacia atrás

Todos los campos nuevos son OPCIONALES a nivel de validación del paso (no deben bloquear que un
usuario avance si los deja vacíos) — no cambiar la regla de qué hace que el paso esté "completo" a
menos que sea trivial de mantener igual que hoy. Si `Step4_Finalidad.jsx` inicializa su estado desde
`data.step4_finalidad` recibido por props, asegurate de que los campos nuevos tengan un valor default
(string vacío / false / null) para expedientes antiguos que no los tengan guardados — no debe romper
al abrir un expediente viejo.

## 4. UI

Mantener el estilo/patrón visual ya usado en ese Step (mismos inputs, mismo layout de tarjetas/
secciones que el resto del wizard). Los campos SÍ/NO nuevos, mismo componente que ya se use en otros
Steps para boolean (ej. lo que usa `realizaTransferencias` en Step5, o un toggle/select consistente).

---

## Al terminar
- `npm run build` sin errores.
- Con backend y front corriendo:
  1. Abrir un expediente EXISTENTE (creado antes de este cambio) en el paso 4 → no rompe, los campos
     nuevos aparecen vacíos, los viejos (finalidad, baseLegal, datosRecopilados) siguen con sus datos.
  2. Llenar los campos nuevos, dar "Siguiente" → se guarda (PUT /pasos/4 → 200).
  3. Salir y reentrar a ese expediente → los campos nuevos persisten con lo que se guardó.
- Reportar archivos tocados y confirmar que no rompiste validación/guardado existente.

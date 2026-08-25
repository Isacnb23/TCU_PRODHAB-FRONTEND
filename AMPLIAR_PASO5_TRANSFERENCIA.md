# Ampliar Paso 5 (Transferencia) — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. `Step5_Transferencia.jsx` hoy captura: `realizaTransferencias`
(boolean), `justificacionGeneral` (texto), y `transferencias` (array de filas: `pais`, `tipo`,
`justificacion`, `baseLegal`).

Backend: SIN CAMBIOS — igual que el Paso 4, `DatosJson` es JSON libre.

## Objetivo
Agregar las columnas que pide la hoja TRANSFERENCIA de la plantilla oficial, que hoy faltan por
cada fila de `transferencias`, sin romper expedientes existentes.

---

## 1. Columnas nuevas por cada fila de `transferencias`

Además de `pais`, `tipo`, `justificacion`, `baseLegal` (ya existentes), agregar:
- `documentosRespaldo` — texto libre, opcional. Label: "Documentos de respaldo"
- `condicionesTransferencia` — texto libre, opcional. Label: "Condiciones de la transferencia"
- `tipoNacionalInternacional` — select con opciones "Nacional" / "Internacional", opcional. Label:
  "Tipo (Nacional/Internacional)"
- `vigencia` — texto libre, opcional. Label: "Vigencia"
- `consideracionesSeguridad` — texto libre, opcional. Label: "Consideraciones de seguridad"

## 2. Compatibilidad hacia atrás

Mismo criterio que el Paso 4: los campos nuevos son opcionales, no bloquean el avance, y las filas
existentes de expedientes viejos deben normalizarse con defaults seguros (`{ ...DEFAULT_ROW, ...fila }`)
para que ningún input quede sin controlar. No cambiar la lógica de `realizaTransferencias` ni el
resto del paso.

## 3. UI

Mismo estilo/patrón que ya usa este Step para el array de transferencias (mismas tarjetas/filas
editables), y mismo componente de SÍ/NO o select que se usó en el Paso 4 para mantener consistencia
visual entre pasos.

---

## Al terminar
- `npm run build` sin errores.
- Con backend y front corriendo, sobre un expediente EXISTENTE con datos viejos de transferencia:
  1. Abrir el paso 5 → sin errores, datos viejos intactos, campos nuevos vacíos.
  2. Llenar los campos nuevos en una fila, "Siguiente" → PUT /pasos/5 → 200, confirmar en la API
     que se guardaron bajo sus propias claves sin pisar las viejas.
  3. Salir y reentrar → los datos nuevos y viejos persisten correctamente.
- Reportar archivos tocados y confirmar que no rompiste validación/guardado existente.

# Ampliar Paso 6 (Riesgos) — Escenario Residual — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. `Step6_Riesgos.jsx` hoy captura, por cada fila de `riesgos`:
`descripcion`, `probabilidad` (1-5), `consecuencia` (id 1-5 → Insignificante/Leve/Moderado/Pesado/
Severo). NRI (probabilidad × valor(consecuencia)) y Nivel se calculan en pantalla, no se guardan.

Backend: SIN CAMBIOS — `DatosJson` es JSON libre.

## Objetivo
Agregar el "Escenario 2: Riesgo Residual" que pide la hoja GESTIÓN DE RIESGOS de la plantilla —
el riesgo DESPUÉS de aplicar controles/medidas, además del riesgo inicial (Escenario 1) que ya existe.
Sin romper expedientes existentes.

---

## 1. Campos nuevos por cada fila de `riesgos`

Además de `descripcion`, `probabilidad`, `consecuencia` (ya existentes = Escenario 1 / riesgo
inherente), agregar:

- `controles` — texto libre, opcional. Label: "Medida de control a aplicar"
- `responsableControl` — texto libre, opcional. Label: "Responsable de aplicar la medida"
- `probabilidadResidual` — entero 1-5, mismo componente/escala que `probabilidad`, opcional.
  Label: "Probabilidad de ocurrencia (después de controles)"
- `consecuenciaResidual` — mismo tipo que `consecuencia` (id 1-5), opcional.
  Label: "Magnitud de las consecuencias (después de controles)"
- `observacionesRiesgo` — texto libre, opcional. Label: "Observaciones"

## 2. Cálculo del riesgo residual (NRR)

Igual que hoy se calcula NRI en pantalla (no se guarda, se deriva), calcular NRR de la misma forma
pero con `probabilidadResidual` × valor(`consecuenciaResidual`), usando la MISMA función/tabla de
niveles que ya existe para NRI (Aceptable ≤4 / Tolerable ≤12 / Alto ≤40 / Muy Alto >40) — reusar el
helper existente, no duplicar la lógica. Mostrar NRI y NRR uno al lado del otro (o en secciones
"Escenario 1" / "Escenario 2" claramente separadas) para que se vea el efecto de aplicar controles.

Si `probabilidadResidual` o `consecuenciaResidual` no están completos (fila vieja o aún sin llenar),
mostrar el NRR como "—" o "Pendiente" en vez de un cálculo erróneo — no forzar un valor con datos
faltantes.

## 3. Compatibilidad hacia atrás

Mismo criterio que Pasos 4 y 5: campos nuevos opcionales, no bloquean el avance del paso (la
validación actual de completitud del Paso 6 no debe exigir los campos residuales), y las filas
existentes se normalizan con defaults seguros al cargar.

## 4. UI

Reorganizar la fila de cada riesgo en dos bloques visuales claros: "Escenario 1 · Riesgo Inherente"
(lo ya existente: descripción, probabilidad, consecuencia, NRI) y "Escenario 2 · Riesgo Residual"
(controles, responsable, probabilidad/consecuencia residual, NRR) — mismo estilo de tarjetas/colores
que ya usa el wizard, sin inventar un patrón visual nuevo.

---

## Al terminar
- `npm run build` sin errores.
- Con backend y front corriendo, sobre un expediente EXISTENTE con riesgos en formato VIEJO:
  1. Abrir el paso 6 → sin errores, riesgos viejos intactos (descripción/probabilidad/consecuencia/
     NRI), campos del Escenario 2 vacíos, NRR muestra "Pendiente"/"—".
  2. Completar el Escenario 2 de un riesgo, "Siguiente" → PUT /pasos/6 → 200; confirmar en la API que
     los 5 campos nuevos se guardaron junto a los viejos, y que el NRR ahora se calcula.
  3. Salir y reentrar → todo persiste correctamente, NRI y NRR ambos calculados.
- Reportar archivos tocados, confirmar que la validación de completitud del paso no se rompió, y que
  el helper de cálculo de nivel de riesgo se reusó (no se duplicó).

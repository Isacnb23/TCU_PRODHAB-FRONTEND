# Destacar subsanación pendiente + confirmación de envío — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. `MisExpedientes.jsx` ya lista los expedientes del usuario con badges
de estado (Borrador/Enviado/RequiereSubsanacion/Aprobado). El wizard YA tiene, dentro del expediente,
un resumen de observaciones al entrar y un banner por paso (`ObservacionesResumen.jsx`, del trabajo
de subsanaciones) — ESO no se toca, ya funciona. Lo que falta es que se note ANTES de entrar, desde
la lista, y que el envío tenga una confirmación clara.

## Alcance
Dos mejoras puntuales de UI en el flujo del Usuario:
1. Que un expediente en `RequiereSubsanacion` se destaque visualmente en la lista "Mis Expedientes"
   (no solo el badge de estado actual, algo que llame más la atención).
2. Que al enviar/reenviar un expediente (ya sea desde Borrador o desde RequiereSubsanacion), la
   confirmación de éxito sea clara y notoria, no un mensaje que pasa desapercibido.

NO tocar el wizard, el resumen de observaciones, el guardado por paso, ni la lógica de envío en sí
(`expedienteService.enviar` ya funciona) — solo la presentación del resultado.

---

## 1. Destacar RequiereSubsanacion en `MisExpedientes.jsx`

Para las filas/tarjetas cuyo `estado === 'RequiereSubsanacion'`:
- Agregar un indicador visual claro además del badge existente: por ejemplo, un ícono de alerta
  (⚠ o similar, coherente con el estilo del proyecto — ya se usa un ícono ámbar en otras partes) junto
  al nombre de la entidad, y/o un borde o fondo sutil ámbar en esa fila para diferenciarla del resto.
  No sobrecargues: sutil pero notorio, manteniendo la paleta PRODHAB (navy/dorado/ámbar).
- Considerá ordenar la lista con los `RequiereSubsanacion` primero (antes que Borrador/Enviado/Aprobado),
  ya que son los que necesitan acción del usuario. Si esto complica el orden existente, es opcional —
  priorizá el indicador visual antes que el reordenamiento.
- Texto de apoyo opcional bajo la entidad: "Requiere tu atención" o similar, corto.

---

## 2. Confirmación clara al enviar/reenviar

Ubicar dónde hoy se muestra el mensaje de éxito tras `expedienteService.enviar()` (en `WizardContainer.jsx`,
el handler `handleEnviar` ya existente). Hoy probablemente es un mensaje simple antes de navegar.
Mejorarlo a algo más notorio:
- Un mensaje de éxito más visible (por ejemplo, un banner/toast verde con ícono de check, con el texto
  "Expediente enviado a PRODHAB correctamente." o "Expediente reenviado correctamente." según
  corresponda), visible el tiempo suficiente para que el usuario lo perciba antes de navegar a
  `/expedientes` (podés mantener la navegación automática, pero que el mensaje se vea un instante,
  ej. con un pequeño delay de 1-2 segundos antes de navegar, o que el mensaje viaje como estado a la
  lista y se muestre ahí apenas aterriza).
- Si optás por mostrar el mensaje ya en `MisExpedientes.jsx` tras aterrizar desde el envío (vía
  `location.state` de react-router), es una buena opción: `navigate('/expedientes', { state: { mensaje: '...' } })`
  y en `MisExpedientes.jsx` leer `location.state?.mensaje` para mostrar un banner de éxito que se
  autodesvanezca. Elegí el enfoque que mejor encaje con lo que ya existe en el proyecto.

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front (5173):
  1. Tener (o generar) un expediente en `RequiereSubsanacion` → en `/expedientes` se ve claramente
     destacado frente a los demás.
  2. Enviar un expediente nuevo (Borrador completo) → confirmar que aparece un mensaje de éxito
     notorio antes/al aterrizar en la lista.
  3. Reenviar uno desde RequiereSubsanacion → mismo tipo de confirmación clara.
- Reportar: qué archivos tocaste y cómo implementaste la confirmación (delay, location.state, u otro
  enfoque). Confirmar que el wizard, guardado por paso y lógica de envío no cambiaron de comportamiento.

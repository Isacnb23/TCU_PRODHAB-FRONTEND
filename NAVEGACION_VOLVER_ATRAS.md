# Navegación "Volver atrás" — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. Todo el sistema funciona: wizard (`/expedientes/:id`,
`WizardPage.jsx` → `WizardContainer.jsx`, con `NavigationButtons.jsx` para Anterior/Siguiente),
Mis Expedientes (`/expedientes`), Revisión del Admin (`/revision`, `/revision/:id`), Gestión de
Usuarios (`/usuarios`).

## Alcance
Tres mejoras de navegación puntuales, de bajo riesgo (solo UI, sin tocar lógica de negocio,
guardado, validación ni permisos):

1. Botón visible para volver a "Mis Expedientes" desde dentro del wizard.
2. Botón "Anterior" claramente visible y funcional dentro del wizard (retroceder de paso en paso).
3. Botón para volver a la Bandeja desde la pantalla de Revisión de un expediente.

NO tocar guardado por paso, validación, rehidratación, ni el flujo de envío/subsanación. Cambios
puramente de navegación/UI.

---

## 0. Diagnóstico primero (no asumir, verificar)

Antes de tocar nada, revisá el estado actual de cada uno de los 3 puntos:
- ¿`WizardContainer.jsx`/`WizardPage.jsx` ya tiene algún link/botón para volver a `/expedientes`? ¿Dónde,
  y qué tan visible es (¿está en el header, escondido en el logo, no existe)?
- ¿`NavigationButtons.jsx` ya tiene un botón "Anterior"? ¿Funciona (llama a algo tipo `handlePrev`)?
  Si existe pero está mal ubicado/poco visible/deshabilitado indebidamente, es lo que hay que arreglar.
- ¿`RevisionExpediente.jsx` ya tiene un link "Volver a la bandeja"? (En capturas anteriores del
  proyecto se vio un link "← Volver a la bandeja" arriba de la pantalla — confirmá si sigue ahí y
  si funciona bien.)

Reportame qué de esto YA existe (aunque esté mal hecho) antes de escribir código, así solo tocamos
lo que realmente falta o está roto.

---

## 1. Volver a Mis Expedientes desde el wizard

En el header/topbar del wizard (donde esté el logo o título PRODHAB dentro de `WizardPage.jsx` o el
`Layout` que envuelve al wizard), agregar o hacer más visible un botón/link **"← Mis Expedientes"**
que navegue a `/expedientes`.

Importante: el progreso del paso actual YA se guarda al dar "Siguiente" (comportamiento existente,
no lo cambies). Si el usuario tiene cambios sin guardar en el paso actual (no llegó a dar Siguiente)
y hace clic en "Mis Expedientes", NO hace falta un guardado automático ni una confirmación de
"¿salir sin guardar?" — el localStorage de respaldo ya cubre esto. Simplemente navegar.

---

## 2. Botón "Anterior" en el wizard

En `NavigationButtons.jsx` (o donde corresponda tras el diagnóstico):
- Debe verse un botón "Anterior" junto al de "Siguiente", visible en todos los pasos EXCEPTO el 1
  (no hay paso 0 al cual volver).
- Al hacer clic: retrocede `currentStep - 1` SIN re-ejecutar la validación del paso actual (retroceder
  no debe estar bloqueado por campos incompletos — solo avanzar lo está, eso ya es el comportamiento
  correcto existente y no se toca).
- NO debe disparar un guardado al retroceder (el guardado va solo en "Siguiente", como ya está
  diseñado — no cambiar esa regla).
- En modo `readOnly` (expediente ya enviado/aprobado), el botón "Anterior" también debe funcionar
  para poder navegar y consultar los pasos anteriores.
- Verificar que el Sidebar (que ya permite ir hacia atrás, según lo documentado en sesiones previas)
  y este botón "Anterior" queden consistentes entre sí (misma función, no lógica duplicada si es
  posible reusar el mismo handler).

---

## 3. Volver a la Bandeja desde Revisión

En `RevisionExpediente.jsx`: confirmar que el link "Volver a la bandeja" (o similar) esté presente,
visible arriba de la pantalla, y navegue correctamente a `/revision`. Si no existe, agregarlo con ese
mismo texto y estilo coherente con el resto (un link con flecha "←", como se ve en otras pantallas
del proyecto).

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front (5173) corriendo, probar:
  1. Dentro del wizard (cualquier paso), el botón "Mis Expedientes" navega correctamente a `/expedientes`.
  2. En el paso 3 del wizard, el botón "Anterior" lleva al paso 2 sin pedir validación ni guardar.
  3. En el paso 1, NO hay botón "Anterior" (o está deshabilitado, según cómo lo resuelvas).
  4. En un expediente en modo solo lectura (Enviado/Aprobado), "Anterior" y "Siguiente" permiten
     navegar los 9 pasos para consultar.
  5. En `/revision/:id`, el link "Volver a la bandeja" lleva a `/revision`.
- Reportar: qué de los 3 puntos ya existía (del diagnóstico inicial) y qué tuviste que agregar o
  arreglar. Confirmar que el guardado por paso, la validación y el envío/subsanación no cambiaron
  de comportamiento.

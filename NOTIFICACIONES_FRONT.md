# Notificaciones del sistema — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. `Header.jsx` ya tiene los links condicionales por rol
("Revisión"/"Usuarios" solo Admin) y el bloque de usuario/cerrar sesión.

Backend YA implementado y probado:
- `GET  /api/notificaciones` → `[{ id, mensaje, expedienteId, leida, fechaCreacion }]` (Authorize,
  cualquier usuario ve las suyas)
- `GET  /api/notificaciones/no-leidas/count` → `{ count: N }`
- `PATCH /api/notificaciones/{id}/leer` → 204

## Alcance
Una campana de notificaciones en el `Header`, visible para CUALQUIER usuario autenticado (no solo
Admin), con contador de no leídas y un dropdown con la lista. NO tocar el resto del Header, ni los
flujos de expedientes/revisión/usuarios existentes.

---

## 1. Servicio — `src/services/notificacionService.js` (nuevo)
```
listar() => apiGet('/notificaciones')
contarNoLeidas() => apiGet('/notificaciones/no-leidas/count')
marcarLeida(id) => apiPatch('/notificaciones/' + id + '/leer')
```

---

## 2. Componente — `src/components/Layout/NotificacionesBell.jsx` (nuevo)

- Ícono de campana en el Header (usar un ícono coherente con los que ya se usan en el proyecto —
  revisá qué librería de íconos está en uso, ej. lucide-react si ya está instalada).
- Badge numérico (círculo rojo/ámbar pequeño) sobre la campana cuando `contarNoLeidas() > 0`, con
  el número (si es más de 9, mostrar "9+").
- Al hacer clic, abre un dropdown/panel con la lista de notificaciones (`listar()`), más recientes
  primero. Cada ítem muestra el mensaje y la fecha relativa o formateada, con un estilo distinto
  para las no leídas (ej. fondo levemente resaltado o punto indicador) vs. las leídas (más apagadas).
- Al hacer clic en una notificación individual: marcarla como leída (`marcarLeida(id)`, actualizar el
  contador local sin esperar refetch completo) y, si tiene `expedienteId`, navegar al lugar
  correspondiente:
  - Si el usuario actual es Admin → `/revision/:expedienteId`
  - Si no → `/expedientes/:expedienteId`
  (Usar `user?.rol` del AuthContext para decidir, mismo patrón que ya se usa en otras partes.)
- Cerrar el dropdown al hacer clic afuera (patrón estándar, revisá si ya existe algún hook/patrón
  similar en el proyecto para no reinventar).
- Refrescar el contador periódicamente es opcional (podés hacer un simple `setInterval` de 30-60s
  llamando `contarNoLeidas()`, o dejarlo solo actualizándose al montar/cuando se abre el dropdown —
  priorizá simplicidad, no es crítico tener tiempo real).
- Estado vacío: "No tienes notificaciones." dentro del dropdown si la lista está vacía.

---

## 3. Integración en Header

Agregar `<NotificacionesBell />` en `Header.jsx`, visible para cualquier usuario autenticado (sin
condición de rol), ubicada de forma natural junto a los demás elementos de la topbar (cerca del
nombre de usuario/cerrar sesión).

---

## Al terminar
- `npm run build` sin errores.
- Con backend y front corriendo:
  1. Como Usuario: enviar un expediente → como Admin (otra sesión/pestaña), la campana muestra un
     número de no leídas > 0.
  2. Clic en la campana → se ve la notificación en el dropdown.
  3. Clic en la notificación → navega a `/revision/:id` (Admin) y el contador baja en 1.
  4. Como Usuario: recibir una notificación de subsanación/aprobación → la campana también funciona
     para ese rol, clic navega a `/expedientes/:id`.
  5. Dropdown cierra al hacer clic afuera.
- Reportar archivos nuevos y el resultado del flujo. Confirmar que el resto del Header y la
  navegación existente no cambiaron de comportamiento.

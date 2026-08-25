# Gestión de Usuarios — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. Ya funciona: login, Mis Expedientes, wizard completo, panel de
Revisión del Admin (`/revision`, protegido por `AdminRoute.jsx`, link condicional en `Header.jsx:40-47`
con `user?.rol === 'Admin'`). `src/services/api.js` (apiGet/apiPost/apiPut/apiDelete/apiPatch si
existe — si no existe apiPatch, agregalo siguiendo el mismo patrón que los demás).

Backend (localhost:5004/api), YA implementado y probado, `[Authorize(Roles = "Admin")]`:
- `POST  /api/usuarios` body `{ nombre, email, password, rol }` (rol: "Admin" | "Usuario") → 201 UsuarioDto
- `GET   /api/usuarios` → 200 `[{ id, nombre, email, rol, activo, fechaCreacion }]`
- `PATCH /api/usuarios/{id}/desactivar` → 204 (soft-delete: Activo=false, no borra)

## Alcance
Una pantalla de gestión de usuarios, accesible solo para Admin. Crear, listar, desactivar. NO tocar
el flujo de expedientes, wizard, ni el panel de Revisión existentes. NO migrar librerías.

---

## 1. Servicio — `src/services/usuarioService.js` (nuevo)
```
crear({ nombre, email, password, rol }) => apiPost('/usuarios', { nombre, email, password, rol })
listar() => apiGet('/usuarios')
desactivar(id) => apiPatch('/usuarios/' + id + '/desactivar')  // si api.js no tiene apiPatch, agregalo
```

---

## 2. Ruta protegida

Nueva ruta `/usuarios` en App.jsx, envuelta con el `AdminRoute` ya existente (mismo patrón que `/revision`).

En `Header.jsx`, junto al link "Revisión" (mismo bloque condicional `user?.rol === 'Admin'`, línea ~40),
agregar un link **"Usuarios"** hacia `/usuarios`.

---

## 3. Pantalla — `src/components/Usuarios/GestionUsuarios.jsx`

Estilo y estructura coherente con `RevisionBandeja.jsx` (misma familia visual: título, tabla, branding
PRODHAB navy/dorado).

- Al montar: `usuarioService.listar()`. Estados de carga y error (mensaje visible, no rompe pantalla).
- Título "Gestión de Usuarios", botón destacado "Nuevo Usuario" (abre modal, ver punto 4).
- Tabla: Nombre, Email, Rol (badge: Admin en un color, Usuario en otro), Estado (badge Activo/Inactivo),
  Fecha de creación, y una columna de acción con botón "Desactivar" (solo visible/habilitado si
  `activo === true`; si ya está inactivo, mostrar el badge "Inactivo" sin botón).
- Clic en "Desactivar": confirmación breve ("¿Desactivar a {nombre}? No podrá iniciar sesión.") →
  `usuarioService.desactivar(id)` → refrescar la lista (o actualizar el estado local del usuario a
  Activo=false sin refetch completo). Manejo de error visible, no intrusivo.
- Estado vacío (no debería pasar nunca porque siempre hay al menos el admin, pero por si acaso):
  no hace falta un mensaje especial, la tabla con una fila alcanza.

---

## 4. Modal "Nuevo Usuario" — `src/components/Usuarios/NuevoUsuarioModal.jsx`

Consistente con `NuevoExpedienteModal.jsx` / `AprobarModal.jsx` (mismo patrón visual de modal del proyecto).

Campos:
- Nombre (texto, requerido)
- Email (email, requerido)
- Password (password, requerido, mínimo 6 caracteres — validación en el front espejando la del
  backend, además de que el backend igual valida)
- Rol (select: "Usuario" / "Admin", default "Usuario")

Botón "Crear usuario": `usuarioService.crear(...)`. Éxito → cierra modal, refresca la lista, mensaje
de éxito breve. Error (ej. email duplicado → 409 del backend, o 400 de validación) → mostrar el
mensaje real del backend dentro del modal, sin cerrarlo, para poder corregir y reintentar.
Botón "Cancelar" cierra sin crear nada.

---

## Al terminar
- `npm run build` sin errores.
- Con backend (5004) y front (5173) corriendo, probar el flujo REAL:
  1. Login como Admin (dev@prodhab.local / dev123). Aparece el link "Usuarios" en el Header.
  2. Ir a `/usuarios` → se ve la lista de usuarios existentes (al menos el admin dev).
  3. "Nuevo Usuario" → crear uno con rol "Usuario" → 201 → aparece en la lista.
  4. Crear otro con el MISMO email → error visible en el modal (409, mensaje del backend), sin romper.
  5. "Desactivar" sobre el usuario recién creado → confirmación → 204 → pasa a badge "Inactivo" sin
     botón de desactivar.
  6. Como usuario NO admin: el link "Usuarios" NO aparece en el Header, y entrar a `/usuarios`
     directamente por URL redirige (AdminRoute ya lo maneja).
  7. Confirmar que ese usuario desactivado ya NO puede iniciar sesión (probar login con sus creds →
     el backend debe rechazar por Activo=false — si no lo hace, reportalo, no lo arregles).
- Reportar: archivos nuevos, y el resultado del flujo (sobre todo el punto 4 y el 7). Confirmar que
  el wizard, Mis Expedientes y el panel de Revisión no cambiaron de comportamiento.
- Limpiar los usuarios de prueba que crees en esta verificación (desactivarlos alcanza, es el patrón
  del sistema).

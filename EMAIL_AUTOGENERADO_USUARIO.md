# Email autogenerado en Nuevo Usuario — Front (prodhab-protocolos)

Frontend `prodhab-protocolos`. `NuevoUsuarioModal.jsx` (Admin, dentro de Gestión de Usuarios) tiene
campos Nombre, Email, Password, Rol. Hoy el Admin escribe el email a mano.

## Objetivo
Que al escribir el "Nombre", el campo Email se autocomplete con una sugerencia (inicial del primer
nombre + primer apellido, en minúsculas, sin tildes/espacios) + un dominio fijo. El campo Email
sigue siendo un input de texto NORMAL y editable — es solo una sugerencia inicial, no una
restricción. NO cambiar el backend (sigue recibiendo `email` como string libre, sin validación de
dominio del lado servidor).

Dominio a usar: `@prodhab.protocolos.cr` (constante — dejarla en una sola variable fácil de cambiar,
ej. `const DOMINIO_EMAIL = '@prodhab.protocolos.cr';` en la parte superior del archivo o en un
`src/utils/` compartido, con un comentario indicando que es el dominio institucional configurado
para este entorno y puede cambiar).

---

## 1. Lógica de sugerencia

Función pura (puede vivir en `src/utils/` o inline en el componente):
```
sugerirEmail(nombre) {
  // "Juan Pérez González" -> "jperez" + DOMINIO_EMAIL
  // Tomar la primera palabra como nombre, la ÚLTIMA palabra como apellido.
  // Minúsculas, sin tildes/diacríticos (normalizar), sin espacios ni caracteres especiales.
  // Si solo hay una palabra (nombre sin apellido), usar esa palabra completa como base.
}
```

---

## 2. Comportamiento en el modal

- Al escribir/cambiar el campo "Nombre", SI el usuario todavía no editó manualmente el campo Email
  (o si el Email actual coincide con la última sugerencia autogenerada), actualizar el Email con la
  nueva sugerencia automáticamente.
- En cuanto el Admin edite el campo Email directamente (a mano), DEJAR de autocompletarlo aunque
  siga cambiando el Nombre — respetar lo que el Admin ya escribió a partir de ahí. (Patrón típico:
  un flag `emailEditadoManualmente` que se activa en el `onChange` del input Email.)
- El campo Email sigue siendo obligatorio y validado como email (igual que hoy) antes de poder crear.
- Si dos nombres generan el mismo local-part sugerido (ej. dos "Juan Pérez"), no hace falta resolver
  colisiones automáticamente — el Admin lo ve como sugerencia y puede ajustarlo a mano si el backend
  rechaza por email duplicado (ya existe ese manejo de error en el modal).

---

## Al terminar
- `npm run build` sin errores.
- Con backend y front corriendo, como Admin:
  1. Abrir "Nuevo Usuario", escribir "Juan Pérez González" en Nombre → Email se autocompleta a algo
     como "jperez@prodhab.protocolos.cr".
  2. Editar el Email a mano (ej. cambiarlo a "jp@prodhab.protocolos.cr") y seguir modificando el
     Nombre → el Email YA NO se sobreescribe automáticamente, respeta lo que el Admin escribió.
  3. Crear el usuario con el email final → funciona igual que antes (backend sin cambios).
- Reportar archivos tocados y confirmar que la creación de usuario, validaciones y manejo de error
  (email duplicado) siguen funcionando igual.

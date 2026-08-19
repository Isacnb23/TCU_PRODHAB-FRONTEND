# Preparación para producción — Backend (Prodhab.Api)

Backend .NET 10 / EF Core / SQL Server, funcionalmente completo y probado (CRUD, wizard, subsanaciones,
auth JWT con roles/propiedad, envío, flujo de revisión Admin con observaciones/aprobar). Hoy corre en
local con: seeder de desarrollo (crea dev@prodhab.local en Development), CORS fijo a localhost:5173,
clave JWT de desarrollo en appsettings.json, connection string a LocalDB.

## Objetivo
Dejar el backend listo para que el equipo de IT de PRODHAB lo instale en SU servidor, sin secretos en
el repo y configurable por entorno. NO cambiar funcionalidad ni endpoints. Solo configuración,
bootstrap de administrador y artefactos de despliegue.

Reglas: no romper el flujo de desarrollo local (que siga funcionando con dotnet run como hasta ahora).

---

## 1. Primer administrador por configuración (reemplaza el seeder de dev por uno unificado)

Problema: el seeder actual solo corre en Development y crea creds fijas. En producción no habría
usuarios → nadie podría iniciar sesión. Solución: un seeder DIRIGIDO POR CONFIGURACIÓN que sirva
para dev y prod.

- Crear `/Configuracion/AdminInicialOptions.cs` (namespace Prodhab.Api.Configuracion):
  `string Nombre`, `string Email`, `string Password`.
- Enlazar sección `"AdminInicial"` con Options pattern.
- Modificar `DbSeeder` (o crear `SeedAdminInicialAsync`): al arrancar, en CUALQUIER entorno, si NO
  existe ningún Usuario, crear un admin a partir de `AdminInicial` (Rol="Admin", Activo=true,
  PasswordHash con BCrypt). Si la sección `AdminInicial` no está configurada o le falta Email/Password,
  NO crear nada y loguear una advertencia clara ("No hay AdminInicial configurado; cree el primer
  usuario administrador manualmente"). Una vez que exista al menos un usuario, el seeder no hace nada
  (idempotente).
- En `appsettings.Development.json`: poner `AdminInicial` con las creds de dev actuales
  (dev@prodhab.local / dev123 / "Usuario de Desarrollo") para que el flujo local siga igual.
- En `appsettings.json`: NO poner password real. Dejar la sección con valores vacíos y un comentario
  (o documentar) que en producción se setea por variables de entorno:
  `AdminInicial__Email`, `AdminInicial__Password`, `AdminInicial__Nombre`.

---

## 2. Secretos por variables de entorno (sacar los de producción del repo)

.NET ya soporta override por variables de entorno con doble guion bajo. Asegurar que:
- **Connection string**: en producción se setea `ConnectionStrings__DefaultConnection` por entorno.
  En appsettings.json dejar la de LocalDB SOLO como valor de desarrollo (o moverla a
  appsettings.Development.json). Que appsettings.json NO tenga una connection string de producción.
- **Clave JWT**: la clave actual de appsettings.json es de DESARROLLO. Moverla a
  appsettings.Development.json. En appsettings.json dejar la sección Jwt con Issuer/Audience/ExpiryHours
  pero SIN una Key real (vacía o placeholder), documentando que en producción va por `Jwt__Key`
  (mínimo 32 caracteres). En el arranque, si el entorno es Production y la Key está vacía, fallar con
  un mensaje claro en vez de arrancar inseguro.

---

## 3. CORS configurable por entorno

Hoy el CORS permite localhost:5173 fijo. Cambiarlo para leer los orígenes permitidos de configuración:
- Sección `"Cors": { "AllowedOrigins": [ "http://localhost:5173" ] }` en appsettings.Development.json.
- En appsettings.json, `Cors:AllowedOrigins` vacío o con placeholder; en producción se setea el dominio
  real del front de PRODHAB por entorno (`Cors__AllowedOrigins__0=https://protocolos.prodhab.go.cr`, etc.).
- La política CORS usa esos orígenes (con AllowAnyHeader/AllowAnyMethod como hoy). Si la lista está
  vacía en producción, loguear advertencia.
- El dev local debe seguir funcionando igual (localhost:5173 desde Development).

---

## 4. Script de migración para el DBA de PRODHAB

Generar un script SQL IDEMPOTENTE de todas las migraciones, para que el equipo de PRODHAB lo aplique
sobre su SQL Server sin necesitar el CLI de EF:
```
dotnet ef migrations script --idempotent -o Migrations/prodhab-esquema-completo.sql
```
Dejar ese archivo en el repo (Migrations/prodhab-esquema-completo.sql). NO aplicar auto-migración en
el arranque (para un entregable de gobierno es mejor que el DBA controle cuándo se corre el schema).

---

## 5. appsettings.Production.json (plantilla sin secretos)

Crear `appsettings.Production.json` como PLANTILLA con la estructura de producción pero SIN valores
secretos (los secretos van por variables de entorno). Incluir Logging apropiado para producción
(Default: Warning o Information), y las secciones Jwt (Issuer/Audience/ExpiryHours), Almacenamiento
(RutaBase con una ruta absoluta de ejemplo comentada), y Cors/AdminInicial vacíos con comentario de
que se completan por entorno. Este archivo sirve de referencia para el equipo de PRODHAB.

Confirmar que `Storage/` (Almacenamiento:RutaBase) funciona con ruta absoluta en producción y sigue
ignorado por git.

---

## 6. (Opcional, útil para operaciones) Endpoint de salud

Agregar un `GET /health` público (AllowAnonymous) que devuelva 200 con un JSON simple
`{ status: "ok" }` (y opcionalmente que verifique la conexión a la BD). Sirve para que IT de PRODHAB
confirme que el servicio está arriba. Bajo esfuerzo; incluir si es directo.

---

## Al terminar
- `dotnet build` limpio.
- Confirmar que en DESARROLLO todo sigue igual: `dotnet run` levanta, el seeder crea dev@prodhab.local
  desde AdminInicial de appsettings.Development.json, login funciona, CORS permite localhost:5173.
- Simular PRODUCCIÓN mínimamente (sin desplegar): correr con `ASPNETCORE_ENVIRONMENT=Production` y las
  variables de entorno seteadas (Jwt__Key, ConnectionStrings__DefaultConnection apuntando a la misma
  LocalDB de prueba, AdminInicial__Email/Password, Cors__AllowedOrigins__0) y verificar:
  - Si la BD está vacía de usuarios, crea el admin desde las env vars.
  - Si falta Jwt__Key en Production, la app falla al arrancar con mensaje claro (probarlo y luego
    setearla).
  - El endpoint /health responde 200.
- Verificar que el script `Migrations/prodhab-esquema-completo.sql` se generó y es idempotente
  (empieza con checks tipo IF NOT EXISTS).
- Reportar: archivos nuevos/modificados, el contenido resumido de appsettings.Production.json, la lista
  EXACTA de variables de entorno que PRODHAB debe setear en su servidor (las voy a necesitar para el
  manual de instalación), y confirmar que el flujo de desarrollo local quedó intacto.

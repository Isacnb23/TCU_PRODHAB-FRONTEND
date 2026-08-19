# Envío final del expediente — Backend (Prodhab.Api)

Backend .NET 10 / EF Core / SQL Server (LocalDB), ya completo y probado:
capa de datos, CRUD de Expedientes, guardado de pasos, subsanaciones, auth JWT con roles y
filtro de propiedad. Arquitectura Controller → Servicio → DbContext. Excepciones centralizadas
(`NotFoundException`→404, `BusinessRuleException`→409, `ForbiddenException`→403, `ValidationException`→400,
`UnauthorizedException`→401). `ICurrentUserService` con `GetUserId()`, `EsAdmin()`.

La entidad `Expediente` ya tiene: Estado (enum EstadoExpediente: Borrador, Enviado, EnRevision,
RequiereSubsanacion, Aprobado), FechaEnvio (nullable), FechaModificacion, PasoActual, UsuarioId.
`DatosFormulario` tiene Paso y Completado (bool). Existe `HistorialExpediente`.

## Alcance
Agregar el endpoint de **envío final** del expediente (Borrador → Enviado) con validación de
completitud. Es la ÚNICA funcionalidad nueva. NO cambiar el esquema de la BD. NO tocar otros
endpoints salvo agregar este. Mantener la arquitectura y el patrón de propiedad existentes.

---

## 1. Servicio — agregar a `IExpedienteService` / `ExpedienteService`

Firma:
```
Task<ExpedienteDetalleDto> EnviarAsync(int id, CancellationToken ct);
```

Constante en el servicio: `PASOS_REQUERIDOS = new[] { 1, 2, 3, 4, 5, 6, 7, 8 }`
(el paso 9 es la revisión/envío, no se exige como "completado" para poder enviar).

Lógica de `EnviarAsync`:
1. Cargar el expediente (con sus `Datos`). Si no existe → `NotFoundException($"No existe el expediente {id}.")`.
2. Chequeo de propiedad (reutilizar el helper de acceso existente): si no es Admin y no es el dueño
   → `ForbiddenException("No tiene acceso a este expediente.")`.
3. Estado permitido: solo se puede enviar desde `Borrador` o `RequiereSubsanacion`.
   Si está en otro estado → `BusinessRuleException($"No se puede enviar un expediente en estado {estado}.")`.
4. **Validación de completitud**: para cada paso en PASOS_REQUERIDOS, verificar que exista una fila
   en `Datos` con ese `Paso` y `Completado == true`. Recolectar los pasos faltantes.
   Si hay faltantes → `BusinessRuleException` con un mensaje claro que los liste, ej:
   `"No se puede enviar el expediente. Faltan completar los pasos: 3, 5."`
   (Usar 409 vía BusinessRuleException — es un conflicto de estado/negocio, no input inválido.)
5. Si todo OK: `Estado = Enviado`, `FechaEnvio = UtcNow`, `FechaModificacion = UtcNow`.
   NO asignar `NumeroExpediente` (queda null — PRODHAB lo asigna después por su proceso interno).
6. Registrar en `HistorialExpediente`: Accion="Envio", Detalle="Expediente enviado a PRODHAB",
   UsuarioId = usuario actual, FechaCambio = UtcNow.
7. `SaveChangesAsync`. Devolver el `ExpedienteDetalleDto` actualizado (con estado Enviado y fechaEnvio).

---

## 2. Controller — agregar a `ExpedientesController`

Endpoint nuevo (el controller ya lleva `[Authorize]`):
- **POST `/api/expedientes/{id:int}/enviar`** → llama a `EnviarAsync` →
  `200 OK` con el `ExpedienteDetalleDto`.
  (404 / 403 / 409 los maneja el handler global.)
Decorar con `[ProducesResponseType]` acorde (200, 403, 404, 409).

---

## Al terminar
- `dotnet build` limpio.
- Levantar la API y probar el flujo REAL (login como dev admin para obtener token; usar Thunder
  Client o curl con el Bearer):
  1. Crear un expediente (POST) → Borrador.
  2. POST `/api/expedientes/{id}/enviar` SIN haber completado pasos → **409** listando los pasos
     faltantes (1..8).
  3. Guardar los pasos 1 a 8 con `completado=true` (PUT /pasos/{n}). Dejar el 9 sin guardar.
  4. POST `/enviar` de nuevo → **200**, estado="Enviado", fechaEnvio con valor, numeroExpediente
     sigue null.
  5. Confirmar que ahora editar un paso de ese expediente (PUT /pasos/1) da **409** (ya no es Borrador).
  6. POST `/enviar` otra vez sobre el ya Enviado → **409** ("No se puede enviar un expediente en
     estado Enviado.").
  7. Con un usuario NO dueño (crear otro usuario, loguear): POST `/enviar` sobre un expediente ajeno
     → **403**.
  8. Verificar en HistorialExpediente que quedó la entrada "Envio".
- Reportar resultados, y confirmar que NINGÚN otro endpoint cambió su comportamiento.
- Limpiar los datos de prueba (dejar el usuario dev).

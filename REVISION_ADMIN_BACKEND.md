# Flujo de revisión del Admin — Backend (Prodhab.Api)

Backend .NET 10 / EF Core / SQL Server (LocalDB), completo y probado: capa de datos, CRUD de
Expedientes, guardado de pasos, subsanaciones (upload validado), auth JWT con roles y propiedad,
envío final (Borrador→Enviado). Arquitectura Controller → Servicio → DbContext. Excepciones
centralizadas (`NotFoundException`→404, `BusinessRuleException`→409, `ForbiddenException`→403,
`ValidationException`→400, `UnauthorizedException`→401). `ICurrentUserService` con `GetUserId()`, `EsAdmin()`.

Entidad `Expediente`: Estado (enum: Borrador, Enviado, EnRevision, RequiereSubsanacion, Aprobado),
NumeroExpediente (string? nullable, con índice único FILTRADO ya existente), FechaEnvio, FechaModificacion.
`DatosFormulario` (Paso, Completado). `Subsanacion` (por Paso/Campo). `HistorialExpediente`.

## Alcance
Implementar el flujo de **revisión del Admin**: observaciones por paso, aprobar (con número de
expediente), solicitar subsanación, y habilitar edición de pasos en RequiereSubsanacion. Esto SÍ
incluye una migración aditiva (nueva tabla Observaciones). NO tocar el esquema de las tablas
existentes. Mantener arquitectura y patrones.

---

## 1. Nueva entidad `Observacion` — `/Models/Observacion.cs` (namespace Prodhab.Api.Models)

| Propiedad | Tipo | Notas |
|---|---|---|
| Id | int | PK |
| ExpedienteId | int | FK |
| Paso | int | 1..9 |
| Texto | string | requerido, max 2000 |
| UsuarioId | int | Admin que la creó (columna simple, SIN navegación — evitar cascade paths) |
| FechaCreacion | DateTime | default UtcNow |

Navegación: `Expediente? Expediente`. Agregar `ICollection<Observacion> Observaciones` a `Expediente`.

En `AppDbContext.OnModelCreating`:
- `Observacion` → FK a Expediente con `OnDelete(Cascade)`. `UsuarioId` como columna int simple (sin FK/navegación).

Generar y aplicar migración: `dotnet ef migrations add AgregarObservaciones` + `dotnet ef database update`.
(Es aditiva: solo crea la tabla Observaciones, no altera las existentes. Verificar el script antes de aplicar.)

---

## 2. DTOs — `/DTOs/Revision` (namespace Prodhab.Api.DTOs.Revision)

**ObservacionInputDto.cs** (item de entrada al solicitar subsanación):
- `int Paso` — [Range(1,9)]
- `string Texto` — [Required], [MaxLength(2000)]

**SolicitarSubsanacionDto.cs**:
- `List<ObservacionInputDto> Observaciones` — [Required], [MinLength(1)] (al menos una observación)

**AprobarDto.cs**:
- `string NumeroExpediente` — [Required], [MaxLength(50)] (ej. "001-01-2026-INS")

**ObservacionDto.cs** (salida):
- `int Id`, `int Paso`, `string Texto`, `DateTime FechaCreacion`

Agregar a `ExpedienteDetalleDto` (el que ya existe): `List<ObservacionDto> Observaciones`.
Poblarla en `ObtenerPorIdAsync` (proyección inline, ordenadas por FechaCreacion desc).

---

## 3. Servicio de revisión — `/Services`

**IRevisionService.cs**
```
Task<ExpedienteDetalleDto> SolicitarSubsanacionAsync(int id, SolicitarSubsanacionDto dto, CancellationToken ct);
Task<ExpedienteDetalleDto> AprobarAsync(int id, AprobarDto dto, CancellationToken ct);
```

**RevisionService.cs** — recibe `AppDbContext`, `ICurrentUserService`, y el `IExpedienteService`
(para reusar `ObtenerPorIdAsync` al devolver el detalle). Reglas:

**SolicitarSubsanacionAsync**:
1. Cargar expediente; si no existe → NotFoundException.
2. Estado debe ser `Enviado`; si no → BusinessRuleException($"Solo se puede solicitar subsanación de un expediente en estado Enviado (actual: {estado}).").
3. Validar que cada `Paso` de las observaciones esté en [1,9] (si no → ValidationException).
4. Crear una fila `Observacion` por cada item del DTO (UsuarioId = admin actual, FechaCreacion=UtcNow).
5. `Estado = RequiereSubsanacion`, `FechaModificacion = UtcNow`.
6. Historial: Accion="SolicitudSubsanacion", Detalle=$"Se solicitaron subsanaciones en {N} paso(s)".
7. SaveChanges. Devolver el ExpedienteDetalleDto actualizado.

**AprobarAsync**:
1. Cargar expediente; si no existe → NotFoundException.
2. Estado debe ser `Enviado`; si no → BusinessRuleException.
3. Validar unicidad del NumeroExpediente: si ya existe otro expediente con ese número →
   BusinessRuleException($"Ya existe un expediente con el número {numero}."). (El índice único filtrado
   es la red de seguridad; hacer también el chequeo previo para dar mensaje amigable.)
4. `Estado = Aprobado`, `NumeroExpediente = dto.NumeroExpediente`, `FechaModificacion = UtcNow`.
5. Historial: Accion="Aprobacion", Detalle=$"Expediente aprobado con número {numero}".
6. SaveChanges. Devolver el ExpedienteDetalleDto actualizado.

Registrar `IRevisionService` en Program.cs (AddScoped).

---

## 4. Controller — endpoints Admin-only

En `ExpedientesController` (o un `RevisionController` nuevo con `[Route("api/expedientes")]`).
AMBOS endpoints `[Authorize(Roles = "Admin")]`:
- **POST `/api/expedientes/{id:int}/solicitar-subsanacion`** body `SolicitarSubsanacionDto` → 200 ExpedienteDetalleDto.
- **POST `/api/expedientes/{id:int}/aprobar`** body `AprobarDto` → 200 ExpedienteDetalleDto.
`[ProducesResponseType]` acorde (200, 400, 403, 404, 409).

---

## 5. Habilitar edición en RequiereSubsanacion

En `DatosFormularioService.GuardarPasoAsync`: la regla actual bloquea si `Estado != Borrador`.
Cambiarla para permitir también `RequiereSubsanacion`:
```
if (estado != Borrador && estado != RequiereSubsanacion)
    throw new BusinessRuleException("Solo se pueden editar los pasos de un expediente en estado Borrador o que requiere subsanación.");
```
(Así el usuario puede corregir los pasos observados antes de reenviar. El envío desde
RequiereSubsanacion ya está permitido en el endpoint de envío — no lo toques.)

Las subsanaciones (SubsanacionService) ya se permiten salvo en estado Aprobado — no cambiar.

---

## 6. (Opcional, útil para el panel Admin) Filtro por estado en el listado

En el GET `/api/expedientes`, aceptar un query param opcional `?estado=Enviado`. Si viene, filtrar
por ese estado (además del filtro de propiedad existente: Admin ve todos, Usuario solo los suyos).
Si el valor no matchea un estado válido, ignorarlo (devolver sin filtrar) o 400 — tu criterio.

---

## Al terminar
- `dotnet build` limpio. Migración `AgregarObservaciones` aplicada (verificar que solo crea la tabla
  Observaciones, sin alterar las existentes).
- Levantar API y probar el flujo REAL (login dev admin para token):
  1. Crear expediente, completar pasos 1-8, enviar → Enviado.
  2. POST `/solicitar-subsanacion` con observaciones en pasos 3 y 5 → 200, estado=RequiereSubsanacion,
     y el GET detalle trae las 2 observaciones.
  3. Como usuario dueño: PUT /pasos/3 (editar el paso observado) → **200** (ahora permitido en RequiereSubsanacion).
  4. Reenviar (POST /enviar) → 200, vuelve a Enviado.
  5. POST `/aprobar` con numeroExpediente "001-01-2026-INS" → 200, estado=Aprobado, número asignado.
  6. Editar un paso del Aprobado → 409 (congelado).
  7. POST `/aprobar` con un número ya usado en otro expediente → 409 (unicidad).
  8. Como usuario NO admin: POST `/solicitar-subsanacion` o `/aprobar` → 403.
  9. POST `/solicitar-subsanacion` sobre un Borrador (no Enviado) → 409.
- Reportar resultados, archivos nuevos/modificados, el script de migración, y confirmar que ningún
  endpoint existente cambió salvo lo indicado (edición en RequiereSubsanacion, filtro opcional).
  Limpiar datos de prueba (dejar usuario dev).

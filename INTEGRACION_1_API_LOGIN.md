# Integración Front ↔ Backend — Parte 1: Capa API + Login JWT

Frontend: `prodhab-protocolos` (React + Vite + TypeScript/JSX + Tailwind). Wizard de 9 pasos,
hoy 100% cliente: estado en `useState` de `App.jsx`, persistencia en localStorage
(claves `prodhab_formData`, `prodhab_currentStep`), SIN auth, SIN llamadas HTTP, SIN `.env`.

Backend ya funcionando (repo aparte, Prodhab.Api): .NET 10, JWT Bearer. Endpoints relevantes:
- `POST /api/auth/login`  body `{ email, password }` → `{ token, expiraEn, usuarioId, nombre, email, rol }`
- `GET  /api/auth/me`     (requiere Bearer) → datos del usuario
- Todos los endpoints de expedientes requieren header `Authorization: Bearer {token}`.
Usuario de desarrollo sembrado en el backend: **dev@prodhab.local / dev123** (rol Admin).

## Alcance de ESTA parte
Montar SOLO la capa base de comunicación con el API y el flujo de login. NO tocar todavía la
lógica del wizard ni el guardado de pasos (eso es la Parte 2). NO migrar a zustand/react-hook-form/
zod/localforage — esas dependencias están instaladas pero muertas y las dejamos así por ahora.
Mantener el `useState` + localStorage existente intacto.

Reglas: cambios mínimos y aislados. No refactorizar lo que ya funciona.

---

## 1. Variables de entorno

Crear `.env` en la raíz del front:
```
VITE_API_URL=http://localhost:5080/api
```
(Ajustar el puerto al que use el backend en local — confirmar en launchSettings del backend; el
último reporte lo levantó en 5080. Si dudás, dejá 5080 y lo corregimos.)

Crear `.env.example` con la misma clave sin valor real, para documentar. Agregar `.env` al
`.gitignore` (no `.env.example`).

---

## 2. Cliente HTTP base — `src/services/api.js`

Un wrapper sobre `fetch` (NO instalar axios; usar fetch nativo). Responsabilidades:
- Leer `import.meta.env.VITE_API_URL` como base URL.
- Inyectar automáticamente el header `Authorization: Bearer {token}` si hay token guardado
  (leerlo de localStorage, clave `prodhab_token`).
- Setear `Content-Type: application/json` para requests con body JSON (pero permitir omitirlo para
  multipart más adelante).
- Parsear la respuesta: si viene JSON, devolver el objeto; si es 204, devolver null.
- Manejo de errores centralizado: si el status es >= 400, lanzar un Error con el mensaje del
  ProblemDetails del backend (el backend devuelve `{ title, detail, status }`). Usar `detail` si
  existe, si no `title`, si no un mensaje genérico.
- **Manejo del 401**: si una respuesta es 401 (token vencido/ausente), limpiar el token de
  localStorage y redirigir a `/login` (o disparar un evento que el AuthContext escuche). Que no
  quede el usuario en un limbo con token muerto.

Exponer métodos: `apiGet(path)`, `apiPost(path, body)`, `apiPut(path, body)`, `apiDelete(path)`,
y dejar preparado `apiPostForm(path, formData)` para multipart (sin Content-Type manual, que el
browser ponga el boundary).

---

## 3. Servicio de auth — `src/services/authService.js`

- `login(email, password)`: `POST /auth/login`, si OK guarda en localStorage `prodhab_token` (el
  token) y `prodhab_user` (JSON con usuarioId, nombre, email, rol). Devuelve el user.
- `logout()`: borra `prodhab_token` y `prodhab_user` de localStorage.
- `getToken()`: lee `prodhab_token`.
- `getUser()`: lee y parsea `prodhab_user` (o null).
- `isAuthenticated()`: hay token válido presente (no vacío).

---

## 4. Contexto de autenticación — `src/context/AuthContext.jsx`

Un React Context que exponga: `user`, `login(email, password)`, `logout()`, `isAuthenticated`,
`loading`. Al montar, si hay token en localStorage, setear el user desde `authService.getUser()`.
Envolver la app con el provider en `main.jsx` (o donde se monte `<App/>`).

---

## 5. Pantalla de login — `src/components/Auth/Login.jsx`

- Formulario simple: email + password, botón "Iniciar sesión".
- Estilo Tailwind coherente con el resto del proyecto (usar los mismos colores/branding PRODHAB
  que ya use el wizard — navy #1B2A4A, dorado, etc. si están definidos).
- Al enviar: llama `login()` del AuthContext. Si falla, muestra el mensaje de error del backend
  (ej. "Credenciales inválidas") sin romper la pantalla. Estado de "cargando" mientras responde.
- Si el login es exitoso, redirige al wizard.
- NO usar etiqueta `<form>` con submit nativo si complica; un onClick en el botón está bien.

---

## 6. Guard de rutas / gating

El proyecto puede o no tener react-router. Verificá:
- **Si hay react-router**: crear un `ProtectedRoute` que redirija a `/login` si no está autenticado,
  y envolver la ruta del wizard. Agregar la ruta `/login`.
- **Si NO hay router** (el wizard se renderiza directo en App.jsx): hacer el gating condicional en
  `App.jsx` — si `!isAuthenticated`, renderizar `<Login/>`; si está autenticado, renderizar el
  wizard como hoy. Mostrar un botón de "Cerrar sesión" en algún lugar visible del layout.

Elegí la opción que corresponda al estado real del proyecto. No instalar react-router si no está.

---

## Al terminar
- `npm run dev` levanta sin errores.
- Con el backend corriendo, probar el flujo REAL:
  1. Abrir la app sin sesión → muestra el login (no el wizard).
  2. Login con dev@prodhab.local / dev123 → entra al wizard.
  3. Login con credenciales malas → muestra "Credenciales inválidas" sin romperse.
  4. Recargar la página estando logueado → sigue logueado (token en localStorage).
  5. Cerrar sesión → vuelve al login y el token se borró.
  6. Confirmar en la pestaña Network del navegador que el POST /auth/login pega al backend y
     devuelve el token, y que se guarda en localStorage como prodhab_token.
- Reportar: estructura de archivos nuevos (services/, context/, components/Auth/), si el proyecto
  tenía router o no, y el resultado del flujo de login. NO tocar todavía el guardado de pasos.
- IMPORTANTE: confirmar que el wizard y su localStorage (prodhab_formData) siguen funcionando igual
  que antes para los usuarios ya logueados — no se rompió nada de lo existente.

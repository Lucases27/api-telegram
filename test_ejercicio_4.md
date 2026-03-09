# Test de Evaluación – Ejercicio 4: Autenticación con Firebase, Roles y Testing

## Instrucciones para el LLM

Sos un evaluador técnico senior. Tu tarea es analizar el código fuente del proyecto actual y generar **dos entregables**:

1. **Reporte de evaluación** con calificación del 1 al 10.
2. **Lista de correcciones** con los problemas encontrados y cómo solucionarlos.

Analizá todo el código del proyecto (archivos, carpetas, configuraciones, lógica, estilos, rutas, endpoints, bot, chat, autenticación, roles, tests) y evaluá según los criterios que se detallan abajo.

---

## Criterios de Evaluación

### A. Buenas Prácticas de Desarrollo (calificar del 1 al 10)

Evaluá cada uno de los siguientes puntos y asigná una nota individual:

1. **Estructura y organización del código**: ¿Las carpetas y archivos siguen una estructura lógica y consistente? ¿Hay separación de responsabilidades (rutas, controladores, servicios, modelos, middlewares)? ¿Los tests están organizados por tipo (unit, integration, e2e)?
2. **Naming conventions**: ¿Los nombres de variables, funciones, archivos y carpetas son descriptivos y consistentes (camelCase, kebab-case, etc.)?
3. **Manejo de errores**: ¿Los endpoints y funciones manejan errores correctamente? ¿Hay try/catch donde corresponde? ¿Las respuestas HTTP usan los códigos de estado adecuados (400, 401, 403, 404, 409, 500)? ¿Los errores de autenticación y autorización se manejan de forma diferenciada?
4. **Variables de entorno**: ¿Se usa un archivo `.env` para configuraciones sensibles (API keys, tokens, credenciales de Firebase, URLs de DB)? ¿Existe un `.env.example`? ¿La service account key de Firebase está excluida del repositorio?
5. **Código limpio**: ¿Hay código comentado, console.logs innecesarios, archivos sin usar o dependencias no utilizadas? ¿Los mocks de testing están bien organizados y no contaminan el código de producción?
6. **Validaciones**: ¿Se validan los datos de entrada en los endpoints (campos requeridos, tipos, formatos)? ¿Se valida el body del registro? ¿Se validan los permisos de propiedad antes de operar sobre una reserva?
7. **Separación de concerns**: ¿La lógica de negocio está separada de las rutas/controladores? ¿El acceso a datos está encapsulado? ¿Los middlewares de auth y roles son módulos independientes y reutilizables?
8. **Reutilización**: ¿Se evita la duplicación de código? ¿Los middlewares de autenticación y autorización se aplican de forma centralizada? ¿Hay helpers compartidos entre tests?
9. **Git**: ¿El `.gitignore` es adecuado (excluye node_modules, .env, builds, service account keys, coverage)? ¿Los commits son descriptivos?
10. **README**: ¿El README explica cómo instalar, configurar y ejecutar el proyecto completo (client y server)? ¿Incluye instrucciones de Firebase, testing y configuración de roles?

### B. Cumplimiento de Requisitos (calificar del 1 al 10)

Verificá que cada uno de estos requisitos esté implementado correctamente:

#### Estructura del Proyecto
- [ ] El proyecto está separado en dos carpetas raíz: `client/` y `server/`.
- [ ] Cada carpeta tiene su propio `package.json` y scripts de inicio.
- [ ] El frontend **no** se sirve desde el backend (no hay `express.static`, no se renderiza HTML desde rutas del servidor).
- [ ] Cada aplicación se puede iniciar por separado.

#### Autenticación con Firebase
- [ ] El frontend usa **Firebase Client SDK** para registro y login (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`).
- [ ] El backend usa **Firebase Admin SDK** para verificar tokens (`verifyIdToken`).
- [ ] El backend **no** gestiona contraseñas ni genera tokens (Firebase se encarga de eso).
- [ ] Existe un modelo **User** en la base de datos propia con los campos: `id`, `firebaseUid`, `email`, `name`, `role`, `createdAt`.
- [ ] No se almacenan contraseñas en la base de datos propia.
- [ ] El endpoint `POST /auth/register` recibe el ID Token de Firebase en el header y crea el usuario en la DB propia con rol `"customer"`.
- [ ] El endpoint `GET /auth/me` retorna los datos del usuario autenticado (incluyendo el rol).
- [ ] El login ocurre directamente en el frontend contra Firebase (no hay endpoint `POST /auth/login` obligatorio en el backend).
- [ ] Las credenciales de Firebase (service account key) **no** están en el repositorio.
- [ ] Las credenciales se configuran mediante variables de entorno.

#### Middleware de Autenticación
- [ ] Existe un middleware que extrae el token del header `Authorization: Bearer <token>`.
- [ ] El middleware verifica el token con `admin.auth().verifyIdToken(token)`.
- [ ] El middleware busca al usuario en la base de datos propia usando el `uid` de Firebase.
- [ ] El middleware adjunta los datos del usuario a `req.user`.
- [ ] Retorna **401** si no se envió token, si es inválido, si está expirado, o si el usuario no existe en la DB propia.

#### Roles y Permisos
- [ ] Existen dos roles: `admin` y `customer`.
- [ ] Todo usuario nuevo se registra como `"customer"` por defecto.
- [ ] Existe al menos un usuario admin (creado por seed o manualmente).
- [ ] Existe un middleware de autorización que valida el rol del usuario.
- [ ] Un `customer` solo puede ver, crear, editar y eliminar **sus propias reservas**.
- [ ] Un `admin` puede gestionar **todas** las reservas sin restricción.
- [ ] Al crear una reserva, el `userId` se asigna automáticamente desde `req.user.id`.
- [ ] Si un `customer` intenta acceder a una reserva ajena, recibe **403 Forbidden**.
- [ ] El modelo de reservas incluye el campo `userId`.

#### Frontend con Framework y Rutas
- [ ] Se usa un framework con sistema de rutas (React Router, Vue Router, Angular, etc.).
- [ ] Los estilos se gestionan con archivos CSS separados o Tailwind CSS (no estilos inline como método principal).
- [ ] El frontend consume exclusivamente la API (no accede directo a la base de datos).
- [ ] Existen las siguientes rutas como páginas independientes:
  - [ ] `/login` — Formulario de inicio de sesión (usa Firebase Client SDK).
  - [ ] `/register` — Formulario de registro (usa Firebase Client SDK + `POST /auth/register`).
  - [ ] `/` o `/dashboard` — Dashboard con indicadores y métricas.
  - [ ] `/reservations` — CRUD completo de reservas.
  - [ ] `/search` — Búsqueda y filtros combinados.
  - [ ] `/chat` — Interfaz de chat con IA.
- [ ] Cada ruta renderiza su propio componente de página.
- [ ] Existe un menú o barra de navegación entre las secciones.
- [ ] La navegación es del lado del cliente (SPA, sin recarga completa).
- [ ] Las rutas protegidas (`/dashboard`, `/reservations`, `/search`, `/chat`) redirigen a `/login` si el usuario no está autenticado.
- [ ] Existe un mecanismo de **ruta protegida** (ProtectedRoute, guard, o equivalente).
- [ ] Se usa `onAuthStateChanged` u otro mecanismo para persistir la sesión de Firebase.
- [ ] Todas las peticiones a la API incluyen el header `Authorization: Bearer <id-token>`.
- [ ] Se maneja la expiración del ID Token de Firebase (refresh con `getIdToken(true)` o manejo de 401).
- [ ] Existe un botón o opción de **cerrar sesión** que llama a `signOut` de Firebase.
- [ ] Se muestra el nombre del usuario y/o su rol en la interfaz.
- [ ] Un `customer` solo ve sus propias reservas. Un `admin` ve todas.

#### Base de Datos
- [ ] Se usa una base de datos con persistencia.
- [ ] El modelo incluye **Restaurantes** (id, name), **Reservas** (id, restaurantId, userId, name, date, createdAt) y **Users** (id, firebaseUid, email, name, role, createdAt).
- [ ] Los restaurantes se pueden cargar como datos semilla (seed).

#### API REST
- [ ] `POST /auth/register` — Registra usuario en la DB propia (requiere Firebase token).
- [ ] `GET /auth/me` — Retorna perfil del usuario autenticado.
- [ ] `GET /restaurants` — Lista restaurantes (requiere auth).
- [ ] `POST /reservations` — Crea una reserva (requiere auth, asigna userId automáticamente).
- [ ] `GET /reservations` — Lista reservas con filtros opcionales, filtradas por rol (customer: propias, admin: todas).
- [ ] `GET /reservations/:id` — Obtiene una reserva por ID (con validación de propiedad).
- [ ] `PUT /reservations/:id` — Actualiza una reserva (con validación de propiedad).
- [ ] `DELETE /reservations/:id` — Elimina una reserva (con validación de propiedad).
- [ ] `POST /chat` — Endpoint de chat con IA (requiere auth).
- [ ] Los filtros `search` y `date` funcionan de forma individual y combinada.

#### Chat con IA
- [ ] El endpoint `POST /chat` requiere autenticación.
- [ ] El LLM conoce la identidad del usuario autenticado (recibe contexto del usuario).
- [ ] Un `customer` solo puede operar sobre sus propias reservas a través del chat.
- [ ] Un `admin` puede operar sobre cualquier reserva a través del chat.
- [ ] El LLM puede interpretar intenciones y ejecutar acciones:
  - [ ] Crear reservas.
  - [ ] Consultar reservas.
  - [ ] Editar reservas.
  - [ ] Eliminar reservas.
  - [ ] Listar restaurantes.
- [ ] Se implementa alguna estrategia de RAG (Function Calling, contexto inyectado, agente, etc.).
- [ ] La vista `/chat` en el frontend muestra:
  - [ ] Campo de texto para escribir mensajes.
  - [ ] Historial de conversación visible.
  - [ ] Distinción visual entre mensajes del usuario y de la IA.

#### Bot de Telegram
- [ ] El bot sigue funcionando con todos los comandos anteriores del Ejercicio 2.
- [ ] El comando `/chat <mensaje>` envía al endpoint `POST /chat` y devuelve la respuesta.
- [ ] El bot se adapta al sistema de autenticación (vinculación por comando, por código, o la estrategia elegida).
- [ ] Un usuario de Telegram debe estar vinculado/autenticado para usar los comandos.

#### Testing
- [ ] Existen **tests unitarios** (mínimo 8) que validan funciones o módulos de forma aislada.
- [ ] Los tests unitarios **mockean Firebase Admin** (no hacen llamadas reales a Firebase).
- [ ] Los tests unitarios cubren al menos:
  - [ ] Middleware de autenticación (sin token → 401).
  - [ ] Middleware de autenticación (token válido → adjunta `req.user`).
  - [ ] Middleware de autenticación (token válido pero usuario no registrado → 401).
  - [ ] Middleware de roles (rol incorrecto → 403).
  - [ ] Middleware de roles (rol permitido → pasa).
  - [ ] Validación de datos de entrada.
- [ ] Existen **tests de integración** (mínimo 6) que validan endpoints completos con base de datos.
- [ ] Los tests de integración **mockean Firebase Admin** a nivel global.
- [ ] Los tests de integración usan una **base de datos de testing** separada de desarrollo.
- [ ] Los tests de integración cubren al menos:
  - [ ] `POST /auth/register` exitoso (201).
  - [ ] `POST /auth/register` con usuario duplicado (409).
  - [ ] `GET /auth/me` con token válido (200).
  - [ ] `GET /reservations` como customer (solo propias).
  - [ ] `GET /reservations` como admin (todas).
  - [ ] `DELETE /reservations/:id` como customer en reserva ajena (403).
- [ ] Existen **tests end-to-end** (mínimo 4) que simulan flujos completos en el navegador.
- [ ] Los tests E2E cubren al menos:
  - [ ] Registro + Login (flujo completo hasta el dashboard).
  - [ ] CRUD de reserva (crear, ver, editar, eliminar).
  - [ ] Protección de rutas (acceso sin auth → redirige a login).
  - [ ] Chat con IA (enviar mensaje y recibir respuesta).
- [ ] Los tests están organizados en carpetas separadas (`tests/unit/`, `tests/integration/`, `tests/e2e/`).
- [ ] Existen scripts de testing en `package.json` (`test`, `test:unit`, `test:integration`, `test:e2e`, `test:coverage`).
- [ ] El coverage se puede generar con un comando.

#### README
- [ ] Explica la estructura del proyecto.
- [ ] Indica cómo instalar dependencias de `client/` y `server/`.
- [ ] Indica cómo configurar la base de datos.
- [ ] Indica cómo crear y configurar el proyecto en Firebase Console.
- [ ] Lista las variables de entorno necesarias para Firebase (client y admin).
- [ ] Indica cómo configurar la API key del LLM.
- [ ] Indica cómo ejecutar backend y frontend.
- [ ] Indica cómo ejecutar cada tipo de test (unitarios, integración, E2E).
- [ ] Menciona qué base de datos se eligió.
- [ ] Menciona qué LLM se eligió.
- [ ] Explica la estrategia de RAG utilizada.
- [ ] Menciona qué framework de testing se eligió y por qué.
- [ ] Explica cómo se configuró la base de datos de testing.
- [ ] Explica cómo se mockeó Firebase en los tests.
- [ ] Indica la estrategia de autenticación del Bot de Telegram y la justifica.

---

## Formato de Salida Esperado

Generá tu respuesta con el siguiente formato:

### Reporte de Evaluación

#### Calificación: Buenas Prácticas de Desarrollo

| Criterio | Nota (1-10) | Observaciones |
|----------|:-----------:|---------------|
| Estructura y organización | X | ... |
| Naming conventions | X | ... |
| Manejo de errores | X | ... |
| Variables de entorno | X | ... |
| Código limpio | X | ... |
| Validaciones | X | ... |
| Separación de concerns | X | ... |
| Reutilización | X | ... |
| Git | X | ... |
| README | X | ... |
| **Promedio** | **X** | |

#### Calificación: Cumplimiento de Requisitos

| Criterio | Nota (1-10) | Observaciones |
|----------|:-----------:|---------------|
| Estructura client/server | X | ... |
| Autenticación con Firebase | X | ... |
| Middleware de autenticación | X | ... |
| Roles y permisos | X | ... |
| Frontend con framework y rutas | X | ... |
| Rutas protegidas y manejo de sesión | X | ... |
| Estilos (CSS/Tailwind) | X | ... |
| Base de datos y modelo | X | ... |
| API REST completa | X | ... |
| Filtros de búsqueda | X | ... |
| Dashboard | X | ... |
| Chat con IA (endpoint + permisos) | X | ... |
| Chat con IA (acciones CRUD) | X | ... |
| Chat (frontend + Telegram) | X | ... |
| Bot de Telegram (auth adaptado) | X | ... |
| Tests unitarios (mínimo 8, Firebase mockeado) | X | ... |
| Tests de integración (mínimo 6, DB de testing) | X | ... |
| Tests E2E (mínimo 4, flujos completos) | X | ... |
| Scripts de testing y coverage | X | ... |
| README completo | X | ... |
| **Promedio** | **X** | |

#### Nota Final: X/10

(Promedio ponderado: Buenas Prácticas 40% + Cumplimiento de Requisitos 60%)

---

### Correcciones a Realizar

Listá cada problema encontrado con el siguiente formato:

#### [Severidad: Alta/Media/Baja] Título del problema

- **Archivo(s) afectado(s):** `ruta/al/archivo`
- **Descripción:** Qué está mal y por qué es un problema.
- **Solución sugerida:** Cómo corregirlo, con ejemplo de código si aplica.

---

Repetí este bloque por cada problema encontrado, ordenando de mayor a menor severidad.

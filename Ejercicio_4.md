# 📌 Desafío Individual – Autenticación con Firebase, Roles y Testing

## 🎯 Objetivo

Extender el proyecto del Ejercicio 3 incorporando:

1. ✅ Sistema de **autenticación con Firebase Authentication** (registro, login, tokens).
2. ✅ **Roles de usuario** (admin y customer) con permisos diferenciados sobre los endpoints.
3. ✅ **Testing automatizado**: unitarios, de integración y end-to-end.
4. ✅ Adaptación del frontend, el chat con IA y el Bot de Telegram al nuevo sistema de autenticación.

---

## 📋 Prerrequisitos

- Haber completado el Ejercicio 3 (Arquitectura separada + Chat con IA).
- La API, el Bot, el Chat y el frontend deben seguir siendo funcionales.
- Crear un proyecto en [Firebase Console](https://console.firebase.google.com/).

---

## 🔐 Parte 1 – Autenticación con Firebase

### 🔹 Arquitectura general

La autenticación se delega completamente a **Firebase Authentication**:

- El **frontend** usa el SDK de Firebase Client para registrar usuarios, iniciar sesión y obtener el **ID Token**.
- El **backend** usa el SDK de Firebase Admin para **verificar** el ID Token recibido en cada request y extraer los datos del usuario.
- El backend **no** gestiona contraseñas, no genera tokens y no implementa lógica de login. Firebase se encarga de todo eso.

```
┌─────────────┐     ID Token      ┌─────────────┐    Verify Token    ┌──────────────┐
│   Frontend   │ ───────────────→ │   Backend    │ ──────────────→   │   Firebase    │
│ (Firebase    │                   │ (Firebase    │                    │   Auth        │
│  Client SDK) │ ←─────────────── │  Admin SDK)  │ ←──────────────   │   Service     │
└─────────────┘     Response      └─────────────┘    User Data       └──────────────┘
```

### 🔹 Configuración de Firebase

#### En Firebase Console:

1. Crear un nuevo proyecto (o usar uno existente).
2. Habilitar el proveedor de autenticación **Email/Password** en Authentication → Sign-in method.
3. Obtener la configuración del proyecto para el frontend (Settings → General → Your apps → Web app).
4. Generar una **clave de cuenta de servicio** para el backend (Settings → Service accounts → Generate new private key).

#### En el frontend (`client/`):

- Instalar `firebase` (SDK de cliente).
- Crear un archivo de configuración con las credenciales del proyecto Firebase.
- Las credenciales del cliente (`apiKey`, `authDomain`, etc.) se configuran mediante variables de entorno.

#### En el backend (`server/`):

- Instalar `firebase-admin` (SDK de administrador).
- Inicializar con la clave de cuenta de servicio.
- La ruta al archivo de credenciales o las credenciales en sí deben estar en variables de entorno.

> ⚠️ **Importante:** La clave de cuenta de servicio (service account key) **nunca** debe subirse al repositorio. Agregarla al `.gitignore`.

### 🔹 Modelo de Usuario en la base de datos

Aunque Firebase gestiona la autenticación, se necesita una entidad **User** en la base de datos propia para almacenar el rol y datos adicionales:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Identificador único | Clave primaria |
| firebaseUid | String (único) | UID del usuario en Firebase |
| email | String (único) | Email del usuario |
| name | String | Nombre del usuario |
| role | String | `"admin"` o `"customer"` |
| createdAt | Timestamp | Fecha y hora de creación |

> 💡 No se almacenan contraseñas. Firebase gestiona todo lo relacionado con credenciales.

### 🔹 Flujo de registro

1. El **frontend** llama a `createUserWithEmailAndPassword` del SDK de Firebase Client.
2. Firebase crea el usuario y devuelve el ID Token.
3. El **frontend** envía una petición al backend `POST /auth/register` con el ID Token en el header y los datos adicionales (name) en el body.
4. El **backend** verifica el token con Firebase Admin, y si es válido, crea el registro del usuario en la base de datos propia con rol `"customer"`.

#### `POST /auth/register`

**Headers:** `Authorization: Bearer <firebase-id-token>`

**Body:**

```json
{
  "name": "María García"
}
```

**Respuesta (201):**

```json
{
  "id": 1,
  "firebaseUid": "abc123xyz",
  "email": "maria@ejemplo.com",
  "name": "María García",
  "role": "customer"
}
```

**Respuesta de error (409):**

```json
{
  "error": "El usuario ya está registrado"
}
```

### 🔹 Flujo de login

1. El **frontend** llama a `signInWithEmailAndPassword` del SDK de Firebase Client.
2. Firebase valida las credenciales y devuelve el ID Token.
3. El **frontend** almacena el token y lo envía en cada petición al backend.
4. No es necesario un endpoint de login en el backend. La autenticación ocurre directamente contra Firebase desde el frontend.

> 💡 Opcionalmente, se puede implementar un `POST /auth/login` en el backend que reciba el ID Token, lo verifique, y retorne los datos del usuario desde la base de datos propia. Esto es útil para que el frontend obtenga el rol y otros datos extra tras el login.

#### `GET /auth/me`

**Headers:** `Authorization: Bearer <firebase-id-token>`

**Respuesta (200):**

```json
{
  "id": 1,
  "firebaseUid": "abc123xyz",
  "email": "maria@ejemplo.com",
  "name": "María García",
  "role": "customer"
}
```

### 🔹 Middleware de autenticación

Se debe implementar un **middleware** que:

1. Extraiga el ID Token del header `Authorization: Bearer <token>`.
2. Verifique el token usando `admin.auth().verifyIdToken(token)` de Firebase Admin.
3. Busque al usuario en la base de datos propia usando el `uid` de Firebase.
4. Adjunte los datos del usuario (incluyendo el rol) al objeto de request (`req.user`).
5. Retorne **401** si el token es inválido, está expirado o no se envió.
6. Retorne **401** si el usuario no existe en la base de datos propia (no completó el registro).

**Ejemplo de middleware:**

```javascript
const admin = require('firebase-admin');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no registrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

---

## 👥 Parte 2 – Roles y Permisos

### 🔹 Roles disponibles

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso total. Puede gestionar todas las reservas y usuarios. |
| `customer` | Solo puede ver, crear, editar y eliminar **sus propias reservas**. |

### 🔹 Asignación de roles

- Todo usuario nuevo se registra con rol `"customer"` por defecto.
- Debe existir al menos un usuario admin. Se puede crear de dos formas:
  - **Seed:** Un script que cree el usuario admin en Firebase y en la base de datos propia.
  - **Manual:** Crear el usuario en Firebase Console y luego insertar el registro en la base de datos con rol `"admin"`.

### 🔹 Matriz de permisos

| Endpoint | Sin auth | Customer | Admin |
|----------|----------|----------|-------|
| `POST /auth/register` | ✅ (con token de Firebase) | — | — |
| `GET /auth/me` | ❌ | ✅ | ✅ |
| `GET /restaurants` | ❌ | ✅ | ✅ |
| `POST /reservations` | ❌ | ✅ (propias) | ✅ |
| `GET /reservations` | ❌ | ✅ (solo propias) | ✅ (todas) |
| `GET /reservations/:id` | ❌ | ✅ (solo propia) | ✅ |
| `PUT /reservations/:id` | ❌ | ✅ (solo propia) | ✅ |
| `DELETE /reservations/:id` | ❌ | ✅ (solo propia) | ✅ |
| `POST /chat` | ❌ | ✅ | ✅ |

### 🔹 Middleware de autorización

Se debe implementar un **middleware de roles** que:

1. Reciba los roles permitidos como parámetro.
2. Verifique que el `req.user.role` tenga permiso para acceder al recurso.
3. Retorne **403 Forbidden** si el usuario no tiene el rol adecuado.

**Ejemplo de uso:**

```javascript
router.delete('/reservations/:id', auth, authorize('admin', 'customer'), deleteReservation);
```

### 🔹 Regla de propiedad (customer)

Un usuario con rol `customer`:

- Al crear una reserva, el campo `userId` se asigna automáticamente desde `req.user.id` (no se envía en el body).
- Solo puede ver, editar y eliminar reservas donde `userId` coincida con su propio `id`.
- Si intenta acceder a una reserva ajena, debe recibir **403 Forbidden**.

### 🔹 Cambios en el modelo de Reservas

Se agrega un campo a la entidad de reservas:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| userId | Referencia | Usuario que creó la reserva |

> 💡 Las reservas existentes (anteriores a la implementación de auth) pueden asignarse al usuario admin por defecto mediante una migración o seed.

---

## 🎨 Parte 3 – Adaptación del Frontend

### 🔹 Nuevas rutas

| Ruta | Sección | Descripción |
|------|---------|-------------|
| `/login` | Login | Formulario de inicio de sesión (usa Firebase Client SDK). |
| `/register` | Registro | Formulario de registro (usa Firebase Client SDK + `POST /auth/register`). |

### 🔹 Flujo de autenticación en el frontend

1. **Registro:**
   - El formulario llama a `createUserWithEmailAndPassword` de Firebase.
   - Si Firebase crea el usuario exitosamente, se obtiene el ID Token.
   - Se envía `POST /auth/register` al backend con el token y el nombre del usuario.
   - Si el registro es exitoso, se redirige al dashboard.

2. **Login:**
   - El formulario llama a `signInWithEmailAndPassword` de Firebase.
   - Si las credenciales son válidas, se obtiene el ID Token.
   - Se almacena el token (en memoria, context o estado global).
   - Se puede llamar a `GET /auth/me` para obtener los datos y el rol del usuario.
   - Se redirige al dashboard.

3. **Persistencia de sesión:**
   - Se puede usar `onAuthStateChanged` de Firebase para detectar si el usuario ya está autenticado al cargar la app.
   - Si hay sesión activa, obtener el ID Token con `getIdToken()` y usarlo en las peticiones.

4. **Peticiones a la API:**
   - Todas las peticiones deben incluir el header `Authorization: Bearer <id-token>`.
   - Se recomienda usar un interceptor (en Axios) o un wrapper de fetch para agregar el header automáticamente.
   - **Importante:** Los ID Tokens de Firebase expiran cada hora. Se debe usar `getIdToken(true)` para refrescar el token cuando sea necesario, o manejar respuestas 401 refrescando el token y reintentando la petición.

5. **Cerrar sesión:**
   - Llamar a `signOut` de Firebase.
   - Limpiar el estado del usuario en la app.
   - Redirigir a `/login`.

### 🔹 Rutas protegidas

- Las rutas `/dashboard`, `/reservations`, `/search` y `/chat` solo deben ser accesibles si el usuario está autenticado.
- Si un usuario no autenticado intenta acceder, debe ser redirigido a `/login`.
- Se recomienda implementar un componente `ProtectedRoute` o equivalente que verifique la sesión de Firebase antes de renderizar la vista.

### 🔹 Adaptación por rol

- **Customer:** El dashboard y las vistas de reservas solo muestran las reservas propias del usuario.
- **Admin:** Ve todas las reservas del sistema y puede gestionarlas sin restricción.
- Se puede mostrar el nombre del usuario y su rol en la barra de navegación.

---

## 🤖 Parte 4 – Adaptación del Chat con IA y Bot de Telegram

### 🔹 Chat con IA

- El endpoint `POST /chat` ahora requiere autenticación.
- El LLM debe conocer **quién es el usuario** que habla para respetar los permisos:
  - Un `customer` solo puede operar sobre sus propias reservas a través del chat.
  - Un `admin` puede operar sobre cualquier reserva.
- El contexto del usuario autenticado debe inyectarse en el prompt o en las herramientas del LLM.

**Ejemplo:**

```
Customer "María" escribe: "Mostrá mis reservas"
→ El LLM consulta GET /reservations filtradas por userId de María.

Admin escribe: "Mostrá todas las reservas de hoy"
→ El LLM consulta GET /reservations?date=hoy sin filtro de usuario.
```

### 🔹 Bot de Telegram

El Bot debe adaptarse al nuevo sistema de autenticación. Se sugiere una de estas estrategias:

**Opción A – Vinculación por comando:**

1. El usuario ejecuta `/vincular email password` en Telegram.
2. El Bot autentica contra Firebase usando el SDK de Admin (`signInWithEmailAndPassword` vía REST API de Firebase) y obtiene un ID Token.
3. Almacena la asociación `chatId → firebaseUid` para identificar al usuario en futuras peticiones.
4. Los comandos posteriores incluyen la identidad del usuario.
5. Se agrega un comando `/desvincular` para cerrar sesión.

**Opción B – Vinculación por código:**

1. El usuario solicita un código de vinculación desde el frontend (se genera un código temporal asociado a su cuenta).
2. Ejecuta `/vincular <código>` en Telegram.
3. El Bot valida el código y asocia el `chatId` con el usuario.

> 💡 La opción A es más directa. La opción B es más segura ya que no se envían credenciales por Telegram. La elección debe justificarse en el README.

---

## 🧪 Parte 5 – Testing

### 🔹 Descripción general

Se deben implementar tests automatizados que cubran las capas críticas de la aplicación. El framework de testing es de libre elección (Jest, Vitest, Mocha, Supertest, Playwright, Cypress, etc.).

### 🔹 Tests unitarios (mínimo 8 tests)

Tests que validen funciones o módulos de forma aislada, sin depender de la base de datos ni de servicios externos.

**Ejemplos de funciones a testear:**

| Función / Módulo | Test sugerido |
|------------------|---------------|
| Middleware de auth | Simular un request sin token → debe retornar 401. |
| Middleware de auth | Simular un request con token válido (mockeando `verifyIdToken`) → debe adjuntar `req.user`. |
| Middleware de auth | Simular un token de Firebase válido pero usuario no registrado en la DB → debe retornar 401. |
| Middleware de roles | Simular un usuario con rol `customer` accediendo a ruta de `admin` → debe retornar 403. |
| Middleware de roles | Simular un usuario con rol permitido → debe llamar a `next()`. |
| Validación de datos | Verificar que un body de reserva incompleto sea rechazado. |
| Validación de datos | Verificar que un body de registro sin nombre sea rechazado. |
| Formateo de respuestas | Verificar que las respuestas del chat tengan el formato esperado. |

> 💡 **Clave para testear con Firebase:** En los tests unitarios se debe **mockear** `firebase-admin`. No se deben hacer llamadas reales a Firebase en tests unitarios. Usar `jest.mock('firebase-admin')` o equivalente para simular `verifyIdToken`.

### 🔹 Tests de integración (mínimo 6 tests)

Tests que validen el comportamiento completo de un endpoint, incluyendo la interacción con la base de datos (puede ser una base de datos de testing o en memoria).

**Flujos a testear:**

| Endpoint | Test sugerido |
|----------|---------------|
| `POST /auth/register` | Con token válido (mockeado) → verificar que se crea el usuario en la DB (201). |
| `POST /auth/register` | Con un firebaseUid ya existente → verificar error (409). |
| `GET /auth/me` | Con token válido → verificar que retorna los datos del usuario con su rol (200). |
| `GET /reservations` | Como customer → verificar que solo retorna reservas propias. |
| `GET /reservations` | Como admin → verificar que retorna todas las reservas. |
| `DELETE /reservations/:id` | Como customer intentando eliminar reserva ajena → verificar error (403). |

> 💡 **Estrategia para tests de integración con Firebase:** Se recomienda mockear el SDK de Firebase Admin a nivel global en el setup de tests. Crear una función helper que genere tokens "fake" y configure el mock de `verifyIdToken` para decodificarlos. Así se pueden testear los endpoints completos sin depender de Firebase real.

**Ejemplo de setup:**

```javascript
// tests/setup.js
const admin = require('firebase-admin');

// Mock de Firebase Admin
jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn(async (token) => {
      // Decodificar un token fake para testing
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      return { uid: payload.uid, email: payload.email };
    }),
  }),
  initializeApp: jest.fn(),
}));

// Helper para generar tokens fake
function createTestToken(uid, email) {
  return Buffer.from(JSON.stringify({ uid, email })).toString('base64');
}
```

> 💡 Se recomienda usar una base de datos separada para testing (por ejemplo, una base SQLite en memoria, una instancia de MongoDB en memoria con `mongodb-memory-server`, o una base PostgreSQL de testing).

### 🔹 Tests end-to-end (mínimo 4 tests)

Tests que validen flujos completos desde el frontend, simulando la interacción real del usuario con el navegador.

**Flujos a testear:**

| Flujo | Descripción |
|-------|-------------|
| Registro + Login | El usuario se registra, es redirigido al login, inicia sesión y llega al dashboard. |
| CRUD de reserva | El usuario logueado crea una reserva, la ve en el listado, la edita y la elimina. |
| Protección de rutas | Un usuario no autenticado intenta acceder a `/reservations` y es redirigido a `/login`. |
| Chat con IA | El usuario envía un mensaje en el chat y recibe una respuesta de la IA. |

> 💡 **E2E con Firebase:** Para los tests E2E se puede usar el **Firebase Auth Emulator** (parte de Firebase Local Emulator Suite). Esto permite crear usuarios y autenticar sin usar Firebase en producción. Alternativamente, se puede crear un usuario de testing en Firebase y usar sus credenciales en los tests.

> 💡 Se recomienda usar Playwright o Cypress para los tests E2E. Ambas herramientas permiten simular interacciones reales del usuario con el navegador.

### 🔹 Estructura sugerida de tests

```
/server
├── src/
├── tests/
│   ├── unit/
│   │   ├── authMiddleware.test.js
│   │   ├── roleMiddleware.test.js
│   │   └── validation.test.js
│   ├── integration/
│   │   ├── auth.routes.test.js
│   │   └── reservations.routes.test.js
│   ├── helpers/
│   │   └── firebaseMock.js
│   └── setup.js
/client
├── src/
├── tests/
│   └── e2e/
│       ├── auth.spec.js
│       ├── reservations.spec.js
│       └── chat.spec.js
```

### 🔹 Scripts de testing

Cada proyecto debe tener scripts para ejecutar los tests:

```json
// server/package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:coverage": "jest --coverage"
  }
}

// client/package.json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

---

## 🔌 Endpoints – Resumen completo

Todos los endpoints de ejercicios anteriores se mantienen. Se agregan los de autenticación:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/register` | ✅ (Firebase token) | Registrar usuario en la DB propia |
| `GET` | `/auth/me` | ✅ | Obtener perfil propio |
| `GET` | `/restaurants` | ✅ | Listar restaurantes |
| `POST` | `/reservations` | ✅ | Crear reserva |
| `GET` | `/reservations` | ✅ | Listar reservas (filtradas por rol) |
| `GET` | `/reservations/:id` | ✅ | Obtener reserva (con validación de propiedad) |
| `PUT` | `/reservations/:id` | ✅ | Actualizar reserva (con validación de propiedad) |
| `DELETE` | `/reservations/:id` | ✅ | Eliminar reserva (con validación de propiedad) |
| `POST` | `/chat` | ✅ | Chat con IA (contexto del usuario autenticado) |

> 💡 Notar que ya no existe un endpoint `POST /auth/login`. El login ocurre directamente en el frontend contra Firebase.

---

## 🧠 Requisitos Técnicos

- Todo lo del Ejercicio 3 sigue vigente.
- Usar **Firebase Authentication** como proveedor de identidad.
- Usar **Firebase Client SDK** en el frontend y **Firebase Admin SDK** en el backend.
- Las credenciales de Firebase (client config y service account) deben estar en variables de entorno, nunca hardcodeadas ni subidas al repositorio.
- Los tests deben poder ejecutarse con un solo comando por tipo (unit, integration, e2e).
- Los tests unitarios y de integración deben **mockear Firebase** y no depender del servicio real.
- Los tests de integración deben usar una base de datos de testing separada de la de desarrollo.
- El coverage de tests unitarios e integración debe ser visible con un comando.

---

## 📦 Entregables

1. Repositorio Git con el código fuente organizado en `client/` y `server/`.
2. Tests automatizados organizados por tipo.
3. Archivo `README` actualizado que incluya, además de todo lo anterior:
   - Cómo crear y configurar el proyecto en Firebase Console.
   - Qué variables de entorno se necesitan para Firebase (client y admin).
   - Cómo ejecutar cada tipo de test (unitarios, integración, E2E).
   - Qué framework de testing se eligió y por qué.
   - Cómo se configuró la base de datos de testing.
   - Cómo se mockeó Firebase en los tests.
   - Estrategia de autenticación del Bot de Telegram (opción A o B) y justificación.

---

## 🎯 Criterios de Evaluación

| Criterio | Peso |
|----------|------|
| Firebase Auth está correctamente integrado (client SDK + admin SDK) | ⭐⭐⭐ |
| El registro crea el usuario en Firebase y en la base de datos propia | ⭐⭐⭐ |
| El middleware verifica el ID Token de Firebase y adjunta el usuario | ⭐⭐⭐ |
| Los roles admin y customer tienen permisos diferenciados | ⭐⭐⭐ |
| Un customer solo puede operar sobre sus propias reservas | ⭐⭐⭐ |
| El frontend implementa login, registro y rutas protegidas con Firebase | ⭐⭐⭐ |
| El ID Token se refresca correctamente (manejo de expiración) | ⭐⭐ |
| El chat con IA respeta el contexto del usuario autenticado | ⭐⭐ |
| El Bot de Telegram se adapta al sistema de autenticación | ⭐⭐ |
| Tests unitarios cubren funciones críticas con Firebase mockeado (mínimo 8) | ⭐⭐⭐ |
| Tests de integración validan endpoints completos (mínimo 6) | ⭐⭐⭐ |
| Tests E2E simulan flujos reales del usuario (mínimo 4) | ⭐⭐ |
| Los tests se ejecutan con scripts claros y documentados | ⭐⭐ |
| Las credenciales de Firebase no están expuestas en el repositorio | ⭐⭐ |
| Todo lo del Ejercicio 3 sigue funcionando | ⭐⭐ |
| El README está completo y actualizado | ⭐ |

---

## 💡 Consejos

- **Empezar por Firebase:** Crear el proyecto en Firebase Console, habilitar Email/Password, y probar que se puede crear un usuario desde el frontend antes de tocar el backend.
- **Probar el flujo completo con Postman:** Crear un usuario en Firebase (desde el frontend o la consola), obtener su ID Token, y usarlo en Postman para verificar que el middleware del backend funciona.
- **Mockear Firebase desde el inicio:** Configurar el mock de `firebase-admin` antes de escribir los tests. Esto evita problemas de dependencia con el servicio real.
- **Firebase Auth Emulator:** Considerar usar el emulador local de Firebase Auth para los tests E2E. Permite crear usuarios sin afectar el proyecto de Firebase real.
- **Base de datos de testing:** Configurar una base separada desde el inicio para no contaminar datos de desarrollo.
- **Tests unitarios primero:** Son los más rápidos de escribir y dan feedback inmediato. Empezar por los middlewares.
- **Aprovechar la IA:** Los tests son un excelente caso de uso para asistencia con IA. Describir el comportamiento esperado y dejar que la IA genere la estructura base del test.
- **Paso a paso sugerido:**
  1. Crear el proyecto en Firebase y configurar Email/Password.
  2. Integrar Firebase Client SDK en el frontend (register + login).
  3. Integrar Firebase Admin SDK en el backend (middleware de verificación).
  4. Crear el modelo de User y el endpoint `POST /auth/register`.
  5. Implementar el middleware de roles y proteger los endpoints.
  6. Escribir tests unitarios de los middlewares (con Firebase mockeado).
  7. Escribir tests de integración de los endpoints.
  8. Adaptar el frontend con rutas protegidas, manejo de token y rol.
  9. Adaptar el chat y el Bot.
  10. Escribir tests E2E de los flujos principales.
- **No romper lo existente:** Verificar frecuentemente que las funcionalidades del Ejercicio 3 siguen operando correctamente.

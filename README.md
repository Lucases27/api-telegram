# Asistente de Reservas con IA, Firebase Auth y Bot de Telegram (Ejercicio 4)

Este proyecto extiende el Ejercicio 3 incorporando autenticación con Firebase Authentication, roles de usuario (admin/customer), y testing automatizado (unitarios, integración y E2E).

## 🚀 Arquitectura del Proyecto

El proyecto obedece al patrón de **Arquitectura Separada** (Frontend y Backend independientes):

- **`/client` (Frontend)**: React + Vite + Tailwind CSS. Rutas: `/login`, `/register`, `/` (Dashboard), `/reservations`, `/search`, `/chat`. Rutas protegidas con `ProtectedRoute`.
  
- **`/server` (Backend)**: Node.js + Express + SQLite (Knex/better-sqlite3). Expone endpoints REST. Verifica tokens de Firebase con Admin SDK. Ejecuta simultáneamente el Bot de Telegram.

- **🔐 Autenticación**: Firebase Authentication (Email/Password). El frontend usa el SDK cliente para autenticar directamente contra Firebase. El backend usa Firebase Admin SDK para verificar el ID Token en cada request.

- **🧠 IA (RAG & Function Calling)**: Google Gemini con Function Calling. El contexto del usuario autenticado (rol, id) se inyecta en el system prompt para respetar los permisos.

## 🗄️ Elecciones Técnicas
- **Base de Datos:** SQLite (Knex) por su simplicidad de configuración. Base de datos separada en memoria (`:memory:`) para los tests de integración.
- **Testing:** Jest + ts-jest + Supertest para tests unitarios e integración. Playwright para tests E2E.
  - **¿Por qué Jest?**: Ecosistema maduro, excelente soporte de mocking (especialmente `jest.mock`) y coexiste sin conflictos con TypeScript.
  - **¿Por qué Playwright?**: Más rápido y estable que Cypress para proyectos TypeScript modernos.
- **Firebase mockeado:** En los tests unitarios e integración, `firebase-admin` se mockea con `jest.mock('firebase-admin')`. Los tokens fake se generan codificando un JSON en base64, que el mock decodifica igual que `verifyIdToken`.

## 🔐 Configuración de Firebase Console

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilitar **Email/Password** en Authentication → Sign-in method.
3. Obtener la configuración web del proyecto (Settings → General → Your apps → Web app).
4. Generar una **clave de cuenta de servicio** (Settings → Service accounts → Generate new private key). Colocar el JSON en la raíz del proyecto (nunca subir al repositorio).

## 📦 Variables de Entorno

### `server/.env`
```env
GEMINI_API_KEY=tu_gemini_key
BOT_TOKEN=tu_bot_token
PORT=3001
# Opcional: Pegar el JSON de la service account como string (alternativa al archivo)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

### `client/.env`
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 🛠️ Instalación y Configuración

### Backend (`/server`)
```bash
cd server
npm install
# Inicializar la BD (crea tablas users, restaurants, reservations + seed)
npx tsx src/migrate.ts
npx tsx src/seed.ts
npm run dev
```

### Frontend (`/client`)
```bash
cd client
npm install
npm run dev
```

> El proxy de Vite redirige automáticamente `/api/*` al backend en el puerto 3001.

## 👤 Creación del usuario Admin

Crear el usuario en Firebase Authentication Console o desde el formulario de registro en la web, luego ejecutar en SQLite:

```sql
UPDATE users SET role = 'admin' WHERE email = 'tu@admin.com';
```

## 🤖 Uso del Bot de Telegram

Busca tu bot en Telegram y usa:
- `/start`: Menú de bienvenida.
- `/vincular <email> <password>`: Vincula tu cuenta Firebase con Telegram. Tus comandos quedarán autenticados. (**Opción A** elegida por ser más directa e inmediata; la Opción B es más segura pero requiere infraestructura adicional de códigos temporales).
- `/desvincular`: Cierra sesión en Telegram.
- `/restaurants`: Lista restaurantes (requiere vinculación).
- `/reservations`: Lista tus reservas (respeta el rol).
- `/reserve <restaurantId> <YYYY-MM-DD> <nombre>`: Crea una reserva.
- `/chat <mensaje>`: Habla con el asistente IA con tu identidad autenticada.

## 🧪 Ejecución de Tests

### Tests unitarios (22 tests)
```bash
cd server
npm run test:unit
```

### Tests de integración (10 tests, BD en memoria)
```bash
cd server
npm run test:integration
```

### Todos los tests con coverage
```bash
cd server
npm run test:coverage
```

### Tests E2E con Playwright (8 tests)
> Requiere que el backend (`server: npm run dev`) y el frontend (`client: npm run dev`) estén en ejecución.
```bash
cd client
npm run test:e2e
```

> Para los tests E2E, configurar las variables `E2E_TEST_EMAIL` y `E2E_TEST_PASSWORD` con un usuario de testing pre-registrado en Firebase.

## 📄 Licencia

Este proyecto es para fines educativos.

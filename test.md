# Test de Evaluación – Ejercicio 3: Arquitectura Separada + Chat con IA

## Instrucciones para el LLM

Sos un evaluador técnico senior. Tu tarea es analizar el código fuente del proyecto actual y generar **dos entregables**:

1. **Reporte de evaluación** con calificación del 1 al 10.
2. **Lista de correcciones** con los problemas encontrados y cómo solucionarlos.

Analizá todo el código del proyecto (archivos, carpetas, configuraciones, lógica, estilos, rutas, endpoints, bot, chat) y evaluá según los criterios que se detallan abajo.

---

## Criterios de Evaluación

### A. Buenas Prácticas de Desarrollo (calificar del 1 al 10)

Evaluá cada uno de los siguientes puntos y asigná una nota individual:

1. **Estructura y organización del código**: ¿Las carpetas y archivos siguen una estructura lógica y consistente? ¿Hay separación de responsabilidades (rutas, controladores, servicios, modelos)?
2. **Naming conventions**: ¿Los nombres de variables, funciones, archivos y carpetas son descriptivos y consistentes (camelCase, kebab-case, etc.)?
3. **Manejo de errores**: ¿Los endpoints y funciones manejan errores correctamente? ¿Hay try/catch donde corresponde? ¿Las respuestas HTTP usan los códigos de estado adecuados (400, 404, 500)?
4. **Variables de entorno**: ¿Se usa un archivo `.env` para configuraciones sensibles (API keys, tokens, URLs de DB)? ¿Existe un `.env.example`?
5. **Código limpio**: ¿Hay código comentado, console.logs innecesarios, archivos sin usar o dependencias no utilizadas?
6. **Validaciones**: ¿Se validan los datos de entrada en los endpoints (campos requeridos, tipos, formatos)?
7. **Separación de concerns**: ¿La lógica de negocio está separada de las rutas/controladores? ¿El acceso a datos está encapsulado?
8. **Reutilización**: ¿Se evita la duplicación de código? ¿Hay componentes, funciones o middlewares reutilizables?
9. **Git**: ¿El `.gitignore` es adecuado (excluye node_modules, .env, builds)? ¿Los commits son descriptivos?
10. **README**: ¿El README explica cómo instalar, configurar y ejecutar el proyecto completo (client y server)?

### B. Cumplimiento de Requisitos (calificar del 1 al 10)

Verificá que cada uno de estos requisitos esté implementado correctamente:

#### Estructura del Proyecto
- [ ] El proyecto está separado en dos carpetas raíz: `client/` y `server/`.
- [ ] Cada carpeta tiene su propio `package.json` y scripts de inicio.
- [ ] El frontend **no** se sirve desde el backend (no hay `express.static`, no se renderiza HTML desde rutas del servidor).
- [ ] Cada aplicación se puede iniciar por separado.

#### Frontend con Framework y Rutas
- [ ] Se usa un framework con sistema de rutas (React Router, Vue Router, Angular, etc.).
- [ ] Los estilos se gestionan con archivos CSS separados o Tailwind CSS (no estilos inline como método principal, no bloques `<style>` embebidos en respuestas del backend).
- [ ] El frontend consume exclusivamente la API (no accede directo a la base de datos).
- [ ] Existen las siguientes rutas como páginas independientes:
  - [ ] `/` o `/dashboard` — Dashboard con indicadores y métricas.
  - [ ] `/reservations` — CRUD completo de reservas (crear, editar, eliminar, listar).
  - [ ] `/search` — Búsqueda y filtros combinados.
  - [ ] `/chat` — Interfaz de chat con IA.
- [ ] Cada ruta renderiza su propio componente de página (no están todas en un mismo componente).
- [ ] Existe un menú o barra de navegación entre las cuatro secciones.
- [ ] La navegación es del lado del cliente (SPA, sin recarga completa).

#### Base de Datos
- [ ] Se usa una base de datos con persistencia (no datos en memoria que se pierden al reiniciar).
- [ ] El modelo incluye las tablas/colecciones de **Restaurantes** (id, name) y **Reservas** (id, restaurantId, name, date, createdAt).
- [ ] Los restaurantes se pueden cargar como datos semilla (seed).

#### API REST
- [ ] `GET /restaurants` — Lista restaurantes.
- [ ] `POST /reservations` — Crea una reserva.
- [ ] `GET /reservations` — Lista reservas con filtros opcionales (`search`, `date`).
- [ ] `GET /reservations/:id` — Obtiene una reserva por ID.
- [ ] `PUT /reservations/:id` — Actualiza una reserva.
- [ ] `DELETE /reservations/:id` — Elimina una reserva.
- [ ] `POST /chat` — Endpoint de chat con IA.
- [ ] Los filtros `search` y `date` funcionan de forma individual y combinada.

#### Chat con IA
- [ ] El endpoint `POST /chat` recibe un mensaje en lenguaje natural y devuelve una respuesta.
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
- [ ] Se agregó el comando `/chat <mensaje>` que envía al endpoint `POST /chat` y devuelve la respuesta.

#### README
- [ ] Explica la estructura del proyecto.
- [ ] Indica cómo instalar dependencias de `client/` y `server/`.
- [ ] Indica cómo configurar la base de datos.
- [ ] Indica cómo configurar la API key del LLM.
- [ ] Indica cómo ejecutar backend y frontend.
- [ ] Menciona qué base de datos se eligió.
- [ ] Menciona qué LLM se eligió.
- [ ] Explica la estrategia de RAG utilizada.

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
| Frontend con framework y rutas | X | ... |
| Estilos (CSS/Tailwind) | X | ... |
| Base de datos y modelo | X | ... |
| API REST completa | X | ... |
| Filtros de búsqueda | X | ... |
| Dashboard | X | ... |
| Chat con IA (endpoint) | X | ... |
| Chat con IA (acciones CRUD) | X | ... |
| Chat (frontend + Telegram) | X | ... |
| Bot de Telegram | X | ... |
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
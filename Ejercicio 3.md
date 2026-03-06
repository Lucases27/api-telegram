# 📌 Desafío Individual – Arquitectura Separada + Chat con IA

## 🎯 Objetivo

Extender el proyecto del Ejercicio 2 incorporando:

1. ✅ Separación real del proyecto en dos aplicaciones independientes: **client** y **server**.
2. ✅ Frontend desarrollado con un framework, con rutas separadas por sección.
3. ✅ Estilos gestionados con CSS o Tailwind (no estilos inline ni embebidos en el backend).
4. ✅ Un endpoint de chat con IA que permita gestionar reservas mediante lenguaje natural, accesible desde el frontend y desde el Bot de Telegram.

---

## 📋 Prerrequisitos

- Haber completado el Ejercicio 2 (API + Frontend + Persistencia + Bot de Telegram).
- La API, el Bot y el frontend deben seguir siendo funcionales.

---

## 📁 Parte 1 – Estructura del Proyecto

### 🔹 Reglas

- El proyecto debe estar organizado en **dos carpetas raíz separadas**:

```
/proyecto
├── client/      ← Aplicación frontend
│   ├── src/
│   ├── package.json
│   └── ...
├── server/      ← API REST + Bot de Telegram
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

- El **frontend** (`client/`) es un proyecto independiente con su propio `package.json`, scripts de inicio y proceso de build.
- El **backend** (`server/`) es un proyecto independiente que expone la API REST y ejecuta el Bot de Telegram.
- **No se permite** servir el frontend desde el backend (no usar `express.static`, no renderizar HTML desde rutas del servidor, no inyectar estilos con `<style>` en respuestas del backend).
- Cada aplicación debe poder iniciarse por separado con su propio comando (por ejemplo: `npm run dev` en cada carpeta).

---

## 🎨 Parte 2 – Frontend con Framework y Rutas

### 🔹 Reglas generales

- Se debe utilizar un **framework o librería con sistema de rutas** (React con React Router, Vue con Vue Router, Angular, Next.js, Nuxt, SvelteKit, etc.).
- Los estilos deben gestionarse con **archivos CSS separados** o con **Tailwind CSS**. No se permite usar únicamente estilos inline ni bloques `<style>` embebidos dentro del HTML servido por el backend.
- El frontend consume **exclusivamente** la API. No debe tener acceso directo a la base de datos.

### 🔹 Rutas obligatorias

Cada sección debe tener **su propia ruta/página**. No se permite concentrar todas las secciones en una sola página ni mezclar contenido de distintas vistas en un mismo componente de página.

| Ruta | Sección | Descripción |
|------|---------|-------------|
| `/` o `/dashboard` | Dashboard | Panel general con indicadores y métricas. |
| `/reservations` | CRUD de Reservas | Listado completo con opciones de crear, editar y eliminar. |
| `/search` | Búsqueda y Filtros | Vista dedicada a consultar reservas con filtros combinados. |
| `/chat` | Chat con IA | Interfaz de chat para gestionar reservas mediante lenguaje natural. |

> ⚠️ **Importante:** Cada ruta debe renderizar un componente de página propio. No se permite, por ejemplo, colocar el contenido del dashboard como una sección dentro de la página de reservas, ni renderizar todas las vistas condicionalmente dentro de un mismo componente.

### 🔹 Navegación

- Debe existir un menú o barra de navegación que permita moverse entre las cuatro secciones.
- La navegación debe ser del lado del cliente (sin recarga completa de la página).

### 🔹 Contenido de cada vista

Las vistas de **Dashboard**, **CRUD de Reservas** y **Búsqueda con Filtros** mantienen los mismos requisitos del Ejercicio 2. La vista de **Chat con IA** se detalla en la Parte 3.

---

## 🗄️ Parte 3 – Base de Datos

La base de datos se mantiene exactamente igual que en el Ejercicio 2. No se requieren cambios en el modelo de datos ni en la elección de motor de base de datos.

### Modelo de datos (recordatorio)

#### Restaurantes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Identificador único | Clave primaria |
| name | String | Nombre del restaurante |

#### Reservas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Identificador único | Clave primaria |
| restaurantId | Referencia | Restaurante asociado |
| name | String | Nombre de quien reserva |
| date | Date | Fecha de la reserva |
| createdAt | Timestamp | Fecha y hora de creación |

Los restaurantes pueden seguir siendo datos semilla (seed).

---

## 🤖 Parte 4 – Chat con IA (Diferencial)

### 🔹 Descripción

Se debe implementar un **endpoint de chat** que reciba mensajes en lenguaje natural y utilice un LLM (Large Language Model) con capacidad de RAG (Retrieval-Augmented Generation) para interactuar con la base de datos a través de la API.

El objetivo es que el usuario pueda **hablar directamente con el chat** y realizar las siguientes operaciones sin usar formularios ni botones:

- **Crear** una reserva.
- **Consultar** reservas existentes.
- **Editar** una reserva.
- **Eliminar** una reserva.

### 🔹 Endpoint

**Método:** `POST /chat`

**Body:**

```json
{
  "message": "Quiero reservar en Restaurante A para mañana a nombre de Carlos"
}
```

**Respuesta:**

```json
{
  "reply": "Listo, Carlos. Tu reserva en Restaurante A para el 2025-07-16 fue creada con éxito. Tu número de reserva es #12."
}
```

### 🔹 Capacidades esperadas del chat

El LLM debe poder interpretar intenciones del usuario y ejecutar las acciones correspondientes. Algunos ejemplos:

| Mensaje del usuario | Acción esperada |
|---------------------|-----------------|
| "Quiero reservar en Restaurante B para el 20 de julio a nombre de María" | Crear reserva (`POST /reservations`) |
| "¿Qué reservas hay para hoy?" | Consultar reservas (`GET /reservations?date=...`) |
| "Mostrá todas las reservas de Juan" | Consultar reservas (`GET /reservations?search=Juan`) |
| "Cambiá la reserva #5 para el 25 de julio" | Editar reserva (`PUT /reservations/5`) |
| "Eliminá la reserva #8" | Eliminar reserva (`DELETE /reservations/8`) |
| "¿Qué restaurantes hay disponibles?" | Listar restaurantes (`GET /restaurants`) |

### 🔹 Implementación del RAG

- El LLM debe tener acceso al contexto de la base de datos para poder responder con información real y actualizada.
- Se puede implementar de diferentes formas:
  - **Function Calling / Tool Use:** El LLM recibe herramientas (tools) que representan los endpoints de la API y decide cuándo invocar cada una según el mensaje del usuario.
  - **Contexto inyectado:** Antes de cada consulta al LLM, se consultan los datos relevantes de la base de datos y se inyectan como contexto en el prompt.
  - **Agente con cadena de acciones:** Se utiliza un framework de agentes (como LangChain, LlamaIndex, Semantic Kernel, etc.) que orqueste las llamadas.
- La elección de LLM es libre (OpenAI, Anthropic, Groq, Ollama local, etc.), pero debe justificarse brevemente en el README.
- La elección de estrategia de RAG también es libre, pero debe explicarse en el README.

> 💡 **Sugerencia:** La forma más directa es usar Function Calling. Se definen los endpoints de la API como herramientas del LLM, y el modelo decide cuál invocar según lo que el usuario le pida.

### 🔹 Vista de Chat en el Frontend

La ruta `/chat` debe mostrar una interfaz de chat funcional:

- Campo de texto para escribir mensajes.
- Historial de la conversación visible (mensajes del usuario y respuestas de la IA).
- Cada mensaje debe distinguirse visualmente (quién habla).
- Al enviar un mensaje, se debe llamar al endpoint `POST /chat` y mostrar la respuesta.

### 🔹 Chat desde el Bot de Telegram

El Bot de Telegram debe incorporar un nuevo comando o modo de chat:

- **Comando:** `/chat <mensaje>` — Envía un mensaje al endpoint `POST /chat` y devuelve la respuesta de la IA.
- **Ejemplo de uso:**
  ```
  /chat Quiero reservar en Restaurante A para mañana a nombre de Pedro
  ```
  ```
  Bot: Listo, Pedro. Tu reserva en Restaurante A para el 2025-07-17 fue creada con éxito. Tu número de reserva es #15.
  ```

> 💡 De esta forma, el Bot de Telegram se convierte en otro canal de acceso al mismo chat inteligente.

---

## 🔌 Endpoints – Resumen completo

Todos los endpoints del Ejercicio 2 se mantienen. Se agrega uno nuevo:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/restaurants` | Listar restaurantes |
| `POST` | `/reservations` | Crear reserva |
| `GET` | `/reservations` | Listar reservas (con filtros opcionales `search` y `date`) |
| `GET` | `/reservations/:id` | Obtener una reserva por ID |
| `PUT` | `/reservations/:id` | Actualizar una reserva |
| `DELETE` | `/reservations/:id` | Eliminar una reserva |
| `POST` | `/chat` | **Nuevo** – Enviar mensaje al chat con IA |

---

## 🧠 Requisitos Técnicos

- Lenguaje y framework de libre elección tanto para backend como frontend.
- El frontend **debe** usar un framework con sistema de rutas.
- Los estilos **deben** manejarse con archivos CSS o Tailwind CSS.
- Backend y frontend en **carpetas separadas** (`server/` y `client/`).
- Código claro, organizado y con buenas prácticas.
- La API, el Bot, el Chat y el frontend deben poder ejecutarse de forma independiente.
- Incluir un archivo `README` actualizado.

---

## 📦 Entregables

1. Repositorio Git con el código fuente organizado en `client/` y `server/`.
2. Archivo `README` que incluya:
   - Estructura del proyecto.
   - Cómo instalar las dependencias de cada parte (`client/` y `server/`).
   - Cómo configurar la base de datos.
   - Cómo configurar la clave de API del LLM utilizado.
   - Cómo ejecutar el backend (API + Bot).
   - Cómo ejecutar el frontend.
   - Qué base de datos se eligió
   - Qué LLM se eligió
   - Qué estrategia de RAG se utilizó y cómo funciona.


## 🎯 Criterios de Evaluación

| Criterio | Peso |
|----------|------|
| El proyecto está correctamente separado en `client/` y `server/` | ⭐⭐⭐ |
| El frontend usa un framework con rutas independientes por sección | ⭐⭐⭐ |
| Los estilos están gestionados con CSS o Tailwind (no inline ni embebidos en el backend) | ⭐⭐ |
| La API funciona correctamente con persistencia | ⭐⭐⭐ |
| El CRUD de reservas es funcional y completo | ⭐⭐⭐ |
| Los filtros funcionan de forma individual y combinada | ⭐⭐ |
| El dashboard muestra información relevante y actualizada | ⭐⭐ |
| El endpoint `/chat` interpreta correctamente las intenciones del usuario | ⭐⭐⭐ |
| El chat permite crear, consultar, editar y eliminar reservas | ⭐⭐⭐ |
| El chat funciona tanto desde el frontend como desde Telegram | ⭐⭐ |
| El código es claro y está bien organizado | ⭐⭐ |
| El Bot de Telegram sigue funcionando con todos los comandos | ⭐ |
| El README está completo y permite reproducir el proyecto | ⭐ |

---

## 💡 Consejos

- **Empezar por la estructura:** Separar el proyecto actual en `client/` y `server/` y verificar que todo siga funcionando.
- **Migrar el frontend a rutas:** Si el frontend actual está en una sola página, separarlo en componentes de página con rutas antes de agregar funcionalidad nueva.
- **Estilos:** Si se venía usando CSS inline o bloques `<style>` en el backend, migrar a archivos CSS o instalar Tailwind.
- **Chat paso a paso:**
  1. Elegir un LLM y obtener una API key.
  2. Crear el endpoint `POST /chat` con una implementación básica (que el LLM responda sin acciones).
  3. Agregar las herramientas/funciones que representan los endpoints de la API.
  4. Probar desde Postman que el chat interprete y ejecute acciones.
  5. Construir la vista de chat en el frontend.
  6. Agregar el comando `/chat` al Bot de Telegram.
- **Probar siempre con Postman** antes de integrar con el frontend o el Bot.
- Verificar que el Bot sigue funcionando con todos los comandos anteriores además del nuevo `/chat`.
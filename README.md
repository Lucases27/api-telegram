# Asistente de Reservas con IA y Bot de Telegram (Ejercicio 3 Completo)

Este proyecto es un sistema de gestión de reservas para restaurantes que integra una interfaz web moderna y separada del backend, un bot de Telegram y un asistente de inteligencia artificial (Gemini) con capacidades RAG para la manipulación de base de datos en lenguaje natural.

## 🚀 Arquitectura del Proyecto

El proyecto obedece al patrón de **Arquitectura Separada** (Frontend y Backend independientes):

- **`/client` (Frontend)**: 
  - Desarrollado con el entorno React, Vite y estilos modernos de Tailwind CSS.
  - Implementa React Router para navegación sin recarga.
  - Rutas construidas: `/` (Dashboard), `/reservations` (CRUD completo), `/search` (Búsqueda y Filtros), `/chat` (Interfaz gráfica de Asistente IA).
  
- **`/server` (Backend)**: 
  - Desarrollado con Node.js, Express, y base de datos relacional SQLite utilizando el Query Builder Knex (`better-sqlite3`).
  - La base de datos guarda Restaurantes y Reservas persistentes de acuerdo al Ejercicio 2.
  - Expone todos los Endpoints REST necesarios (`GET /restaurants`, `POST`, `PUT`, `DELETE`, etc).
  - Ejecuta de forma simultánea un Bot de Telegram con `Telegraf`.

- **🧠 IA (RAG & Function Calling)**:
  - Integración bajo el endpoint `POST /api/chat` usando el modelo de **Google Gemini** (`@google/genai`).
  - Se le brinda al LLM capacidades de Tool Use/Function Calling. Cuando el usuario envía una instrucción en lenguaje natural (Ej: "Cancela la reserva #8"), Gemini la enruta a las herramientas integradas del modelo que a su vez se conectan directamente con la base de datos SQL. 
  - La IA está enlazada y accesible tanto desde la interfaz web en `/chat` como desde el canal del Bot de Telegram usando el comando `/chat`.

## 🗄️ Elecciones Técnicas
- **Base de Datos:** Se eligió SQLite (a través de Knex) porque no requiere dependencias de infraestructura locales ni configuraciones avanzadas para ejecutar el proyecto, simplificando el testeo y mantenimiento.
- **LLM y RAG Estratégico:** Se eligió `gemini-3-flash-preview` por su velocidad de respuesta para aplicaciones de chat interactivo y su alta precisión al hacer *Function Calling*. La estrategia elegida de RAG no inyecta el contexto SQL completo por anticipado, en su lugar registra las herramientas (`create_reservation`, `list_reservations`, etc.) de forma directa para que Gemini descifre la intención e invoque funciones y retorne respuestas certeras y concretas al frontend o al usuario de Telegram.

## 🛠️ Requisitos del Entorno

- Node.js (v18 o superior)
- Una clave de API de Google Gemini Studio
- Un token de Bot de Telegram (obtenido vía @BotFather)

## 📦 Instalación y Configuración

El proyecto está separado, por lo que debes iniciar las dependencias y los procesos de ambas partes:

### 1. Configurar y encender el Backend (`/server`)

1. Navega a `server/` e instala las dependencias:
   ```bash
   cd server
   npm install
   ```
2. Crea un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Configura tus claves maestras en el `.env` (`GEMINI_API_KEY` y `BOT_TOKEN`).
4. Genera la carpeta `data` e inicializa las tablas / el seed (El script de inicio lo hace automáticamente, pero si deseas hacerlo a mano):
   ```bash
   npm run setup:db
   ```
5. Inicia el servidor. Se levantará la API REST y también el oyente del Bot de Telegram de forma interactuable en el puerto 3001:
   ```bash
   npm run dev
   ```

### 2. Configurar y encender el Frontend (`/client`)

Abre una nueva terminal y ejecuta:

1. Navega a la carpeta cliente e instala las dependencias:
   ```bash
   cd client
   npm install
   ```
2. Inicia el ecosistema en vivo del frontend (El Vite-server apuntará automáticamente por defecto a sus puertos libres como 5173 o 5174):
   ```bash
   npm run dev
   ```

*(El proxy hacia el backend ya está diseñado en la configuración).*

## 🤖 Uso del Bot de Telegram

Busca tu bot asociado al Token que integraste en Telegram y usa los siguientes comandos:
- `/start`: Conoce al bot y su menú.
- `/restaurants`: Lista los restaurantes existentes.
- `/reserve <restaurantId> <YYYY-MM-DD> <tu_nombre>`: Comando estático de creación.
- `/reservations`: Lista tus citas reservadas globalmente.
- `/chat <mensaje>`: Comando mágico que invoca de forma inteligente al LLM de backend para interactuar con tus intenciones, desde listar algo hasta modificar o borrar por ti.

## 📄 Licencia

Este proyecto es para fines educativos.

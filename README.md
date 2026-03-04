# API + Bot de Telegram

## 🚀 Cómo ejecutar la API

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   BOT_TOKEN=TU_TOKEN_DE_TELEGRAM
   PORT=3000
   ```
   Reemplaza `TU_TOKEN_DE_TELEGRAM` por el token real de tu bot (obtenido de @BotFather en Telegram).
3. Inicia la API y el bot juntos:
   ```bash
   npm run dev
   ```
   Esto levantará tanto la API como el bot de Telegram.

---

## 🧪 Cómo probar la API

Puedes usar Postman, Insomnia o cualquier herramienta similar para probar los endpoints:

- **Listar restaurantes:**
  - Método: `GET`
  - URL: `http://localhost:3000/restaurants`

- **Crear reserva:**
  - Método: `POST`
  - URL: `http://localhost:3000/reservations`
  - Body (JSON):
    ```json
    {
      "restaurantId": 1,
      "name": "Juan"
    }
    ```

- **Listar reservas:**
  - Método: `GET`
  - URL: `http://localhost:3000/reservations`

---

## 🤖 Cómo configurar y usar el bot de Telegram

1. Crea un bot en Telegram hablando con [@BotFather](https://t.me/BotFather) y copia el token que te entrega.
2. Pega el token en el archivo `.env` en la variable `BOT_TOKEN`.
3. Inicia el proyecto con `npm run dev`.
4. Busca tu bot en Telegram y usa los siguientes comandos:
   - `/start`: Ver mensaje de bienvenida.
   - `/restaurants`: Ver la lista de restaurantes.
   - `/reserve`: Ver instrucciones para reservar.
   - `/reserve <restaurantId> <tu_nombre>`: Crear una reserva (ejemplo: `/reserve 1 Juan`).
   - `/reservations`: Ver todas las reservas creadas.

---

## 📋 Notas
- La API y el bot funcionan en memoria, no hay base de datos.
- Puedes modificar el puerto cambiando la variable `PORT` en el archivo `.env`.
- Si tienes dudas, revisa el archivo `Ejercicio 1.md` para ver los requisitos y ejemplos.

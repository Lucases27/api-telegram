# 📌 Desafío Individual – API + Bot de Telegram

## 🎯 Objetivo

Desarrollar:

1. ✅ Una API REST simple.
2. ✅ Un Bot de Telegram que consuma esa API.

Primero debe funcionar la API sola (probada con Postman). Después, el Bot debe usar esa misma API.

---

## 🧱 Parte 1 – API REST

### 🔹 Reglas

- Hay 3 restaurantes fijos (hardcodeados en memoria).
- Existe un único turno fijo (ejemplo: 21:00).
- Se pueden crear todas las reservas que se deseen.
- No hay límite de cupos.
- No hay base de datos.
- Todo se maneja en memoria.

### 🔌 Endpoints requeridos

#### 1️⃣ Listar restaurantes

**Método:** `GET /restaurants`

**Ejemplo de respuesta:**

```json
[
  { "id": 1, "name": "Restaurante A" },
  { "id": 2, "name": "Restaurante B" },
  { "id": 3, "name": "Restaurante C" }
]
```

#### 2️⃣ Crear reserva

**Método:** `POST /reservations`

**Body:**

```json
{
  "restaurantId": 1,
  "name": "Juan"
}
```

**La API debe:**

- Validar que el restaurante exista.
- Crear la reserva.
- Devolver un mensaje de confirmación.

#### 3️⃣ Listar reservas (opcional pero recomendable)

**Método:** `GET /reservations`

---

### 🧪 Validación Obligatoria

Antes de desarrollar el bot, se debe demostrar que:

- Se pueden listar restaurantes.
- Se pueden crear reservas.
- Se pueden listar reservas creadas.

Todo debe ser probado con Postman o herramientas similares.

---

## 🤖 Parte 2 – Bot de Telegram

### Funcionalidades del Bot

El Bot debe:

- Responder al comando `/start`.
- Mostrar la lista de restaurantes.
- Permitir elegir un restaurante.
- Confirmar que la reserva fue creada.

### Interacción con la API

El Bot debe llamar a los siguientes endpoints:

- `GET /restaurants`
- `POST /reservations`

⚠️ **Nota:** El Bot no debe tener lógica de negocio propia. Su única función es consumir la API.

---

## 🧠 Requisitos Técnicos

- Lenguaje de programación libre.
- Uso de Visual Studio Code.
- Uso de Copilot permitido.
- Código claro y simple.
- Incluir un archivo `README` con instrucciones para ejecutar el proyecto.

---

## 📦 Entregables

1. Repositorio Git con el código fuente.
2. Archivo `README` que incluya:
   - Cómo ejecutar la API.
   - Cómo probarla.
   - Cómo configurar el bot.
3. Video corto mostrando:
   - La API funcionando en Postman.
   - El Bot creando una reserva.

---

## 🎯 Criterios de Evaluación

- Que el proyecto funcione correctamente.
- Que el Bot consuma la API.
- Que el código sea entendible.
- Que la API pueda usarse de forma independiente al Bot.

---

## 🔧 Comandos del Bot

El Bot de Telegram incluirá un comando para cada acción de la API:

- `/start`: Inicia la interacción con el Bot.
- `/restaurants`: Lista los restaurantes disponibles.
- `/reserve`: Permite crear una reserva.
- `/reservations`: Lista las reservas creadas (si se implementa este endpoint en la API).


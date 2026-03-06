# 📌 Desafío Individual – Frontend + Persistencia

## 🎯 Objetivo

Extender el proyecto del Ejercicio 1 incorporando:

1. ✅ Un frontend con dashboard, CRUD de reservas y visualización con filtros.
2. ✅ Persistencia de datos en una base de datos (relacional o no relacional).

La API desarrollada en el Ejercicio 1 debe adaptarse para soportar las nuevas funcionalidades. El frontend consume exclusivamente la API.

---

## 📋 Prerrequisitos

- Haber completado el Ejercicio 1 (API REST + Bot de Telegram).
- La API debe seguir siendo funcional e independiente del frontend.
- El Bot de Telegram debe seguir funcionando.

---

## 🗄️ Parte 1 – Persistencia de Datos

### 🔹 Reglas

- Reemplazar el almacenamiento en memoria por una base de datos.
- Se puede utilizar una base de datos **relacional** (MySQL, PostgreSQL, SQLite) o **no relacional** (MongoDB, Firebase, etc.).
- La elección es libre, pero debe justificarse brevemente en el README.
- Los restaurantes pueden seguir siendo datos semilla (seed) que se insertan al iniciar la aplicación.

### 🔹 Modelo de datos mínimo

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

> ⚠️ **Nota:** El campo `date` es nuevo. Representa la fecha para la cual se realiza la reserva y es necesario para el filtro por día en el frontend.

---

### 🔌 Endpoints actualizados

Los endpoints del Ejercicio 1 se mantienen, con las siguientes modificaciones y adiciones:

#### 1️⃣ Listar restaurantes

**Método:** `GET /restaurants`

Sin cambios.

#### 2️⃣ Crear reserva

**Método:** `POST /reservations`

**Body actualizado:**

```json
{
  "restaurantId": 1,
  "name": "Juan",
  "date": "2025-07-15"
}
```

#### 3️⃣ Listar reservas

**Método:** `GET /reservations`

Debe soportar los siguientes **query params** opcionales:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| search | String | Búsqueda por nombre del cliente |
| date | String (YYYY-MM-DD) | Filtro por fecha de reserva |

**Ejemplos:**

```
GET /reservations
GET /reservations?search=Juan
GET /reservations?date=2025-07-15
GET /reservations?search=Juan&date=2025-07-15
```

#### 4️⃣ Obtener una reserva por ID

**Método:** `GET /reservations/:id`

#### 5️⃣ Actualizar una reserva

**Método:** `PUT /reservations/:id`

**Body:**

```json
{
  "restaurantId": 2,
  "name": "Juan Pérez",
  "date": "2025-07-16"
}
```

#### 6️⃣ Eliminar una reserva

**Método:** `DELETE /reservations/:id`

---

## 🖥️ Parte 2 – Frontend

### 🔹 Reglas generales

- Framework o librería de libre elección (React, Vue, Angular, Svelte, vanilla JS, etc.).
- El frontend debe consumir **exclusivamente** la API. No debe tener acceso directo a la base de datos.
- El diseño debe ser funcional y prolijo. No se exige un diseño elaborado, pero sí legible y ordenado.

---

### 📊 Vista 1 – Dashboard (Panel General)

El dashboard debe mostrar un resumen general con al menos los siguientes indicadores:

- **Total de reservas** registradas.
- **Reservas por restaurante** (cantidad de reservas en cada restaurante).
- **Reservas del día** (cantidad de reservas para la fecha actual).

> 💡 Se puede agregar cualquier indicador adicional que se considere útil (por ejemplo, restaurante más reservado, reservas de la última semana, etc.).

---

### ✏️ Vista 2 – CRUD de Reservas

Debe permitir realizar todas las operaciones sobre las reservas:

| Operación | Descripción |
|-----------|-------------|
| **Crear** | Formulario para crear una nueva reserva seleccionando restaurante, ingresando nombre y fecha. |
| **Leer** | Listado o tabla con todas las reservas existentes. |
| **Actualizar** | Posibilidad de editar una reserva existente. |
| **Eliminar** | Posibilidad de eliminar una reserva con confirmación previa. |

#### Consideraciones

- Al crear o editar, el selector de restaurantes debe obtener la lista desde `GET /restaurants`.
- La tabla de reservas debe mostrar: nombre del cliente, nombre del restaurante, fecha de la reserva.
- Debe haber feedback visual al realizar operaciones (mensajes de éxito o error).

---

### 🔍 Vista 3 – Visualización con Filtros

Una vista dedicada a consultar reservas con capacidad de filtrado:

- **Buscador por texto:** Filtra reservas por nombre del cliente.
- **Filtro por fecha:** Permite seleccionar una fecha específica.
- **Combinación de filtros:** Ambos filtros deben poder aplicarse simultáneamente.
- Los filtros deben consumir el endpoint `GET /reservations` con los query params correspondientes.

#### Comportamiento esperado

- Al escribir en el buscador, se filtran las reservas en tiempo real o al presionar un botón de búsqueda.
- Al seleccionar una fecha, se muestran solo las reservas de ese día.
- Al combinar ambos, se muestran las reservas que coincidan con los dos criterios.
- Si no hay resultados, se debe mostrar un mensaje indicándolo.

---

## 🧠 Requisitos Técnicos

- Lenguaje y framework de libre elección tanto para backend como frontend.
- Uso de Visual Studio Code.
- Uso de Copilot permitido.
- Código claro, organizado y con buenas prácticas.
- La API, el Bot y el frontend deben poder ejecutarse de forma independiente.
- Incluir un archivo `README` actualizado.

---

## 📦 Entregables

1. Repositorio Git con el código fuente actualizado.
2. Archivo `README` que incluya:
   - Cómo instalar las dependencias.
   - Cómo configurar la base de datos.
   - Cómo ejecutar la API.
   - Cómo ejecutar el frontend.
   - Cómo ejecutar el Bot de Telegram.
   - Qué base de datos se eligió y por qué (breve justificación).
3. Video corto mostrando:
   - El dashboard con los indicadores.
   - El CRUD completo funcionando.
   - Los filtros combinados en acción.
   - La API respondiendo desde Postman.
   - El Bot de Telegram sigue funcionando.

---

## 🎯 Criterios de Evaluación

| Criterio | Peso |
|----------|------|
| La API funciona correctamente con persistencia | ⭐⭐⭐ |
| El CRUD de reservas es funcional y completo | ⭐⭐⭐ |
| Los filtros funcionan de forma individual y combinada | ⭐⭐⭐ |
| El dashboard muestra información relevante y actualizada | ⭐⭐ |
| El código es claro y está bien organizado | ⭐⭐ |
| El Bot de Telegram sigue funcionando con la API actualizada | ⭐ |
| El README está completo y permite reproducir el proyecto | ⭐ |

---

## 💡 Consejos

- Empezar por la persistencia: migrar la API de memoria a base de datos.
- Luego agregar los endpoints nuevos (PUT, DELETE, filtros).
- Probar todo con Postman antes de empezar el frontend.
- Construir el frontend de forma incremental: primero el listado, luego el formulario, después los filtros y por último el dashboard.
- Verificar que el Bot sigue funcionando después de los cambios en la API.

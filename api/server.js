require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());


const db = require('../src/db');

const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});


app.get('/restaurants', async (req, res) => {
  try {
    const restaurantes = await db('restaurants').select('*');
    res.json(restaurantes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener restaurantes' });
  }
});


app.post('/reservations', async (req, res) => {
  const { restaurantId, name, date } = req.body;
  if (!restaurantId || !name || !date) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    const restaurante = await db('restaurants').where({ id: restaurantId }).first();
    if (!restaurante) {
      return res.status(400).json({ error: 'Restaurante no encontrado' });
    }
    const [id] = await db('reservations').insert({ restaurantId, name, date });
    res.json({ message: `Reserva confirmada para ${name} en ${restaurante.name} el ${date}`, id });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
});


app.get('/reservations', async (req, res) => {
  const { search, date } = req.query;
  try {
    let query = db('reservations').join('restaurants', 'reservations.restaurantId', 'restaurants.id')
      .select('reservations.id', 'reservations.name', 'reservations.date', 'restaurants.name as restaurantName', 'reservations.restaurantId', 'reservations.createdAt');
    if (search) {
      query = query.where('reservations.name', 'like', `%${search}%`);
    }
    if (date) {
      query = query.where('reservations.date', date);
    }
    const reservas = await query;
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

app.get('/reservations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await db('reservations')
      .join('restaurants', 'reservations.restaurantId', 'restaurants.id')
      .select(
        'reservations.id',
        'reservations.name',
        'reservations.date',
        'restaurants.name as restaurantName',
        'reservations.restaurantId',
        'reservations.createdAt'
      )
      .where('reservations.id', id)
      .first();

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(reserva);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
});

app.put('/reservations/:id', async (req, res) => {
  const { id } = req.params;
  const { restaurantId, name, date } = req.body;

  if (!restaurantId || !name || !date) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const reserva = await db('reservations').where({ id }).first();

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const restaurante = await db('restaurants').where({ id: restaurantId }).first();

    if (!restaurante) {
      return res.status(400).json({ error: 'Restaurante no encontrado' });
    }

    await db('reservations')
      .where({ id })
      .update({ restaurantId, name, date });

    res.json({
      message: 'Reserva actualizada correctamente'
    });

  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
});

app.delete('/reservations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await db('reservations').where({ id }).first();

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    await db('reservations').where({ id }).del();

    res.json({ message: `Reserva #${id} eliminada` });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});

require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const restaurantes = [
  { id: 1, name: 'Restaurante A' },
  { id: 2, name: 'Restaurante B' },
  { id: 3, name: 'Restaurante C' }
];
const reservas = [];


app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

app.get('/restaurants', (req, res) => {
  res.json(restaurantes);
});

app.post('/reservations', (req, res) => {
  const { restaurantId, name } = req.body;
  const restaurante = restaurantes.find(r => r.id === restaurantId);
  if (!restaurante) {
    return res.status(400).json({ error: 'Restaurante no encontrado' });
  }
  const reserva = {
    id: reservas.length + 1,
    restaurantId,
    name,
    turno: '21:00'
  };
  reservas.push(reserva);
  res.json({ message: `Reserva confirmada para ${name} en ${restaurante.name} a las 21:00` });
});

app.get('/reservations', (req, res) => {
  res.json(reservas);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const app = express();


app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

app.get('/restaurants', (req, res) => {
  const restaurantes = [
    { id: 1, name: 'Restaurante A' },
    { id: 2, name: 'Restaurante B' },
    { id: 3, name: 'Restaurante C' }
  ];
  res.json(restaurantes);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${PORT}`);
});

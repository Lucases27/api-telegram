require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Comando de prueba
bot.start((ctx) => ctx.reply('¡Bot funcionando correctamente!'));

// Lanzar el bot
bot.launch();

// Endpoint básico para comprobar que el servidor Express funciona
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

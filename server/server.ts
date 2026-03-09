import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import apiApp from './api/server.ts';
import bot from './src/bot/bot.ts';
import db from './src/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3001;

  if (!fs.existsSync('.env')) {
    console.warn('ARCHIVO .env NO ENCONTRADO. Asegúrate de crear uno basado en .env.example');
  }

  console.log('GEMINI_API_KEY is', process.env.GEMINI_API_KEY ? 'DEFINED' : 'UNDEFINED');
  console.log('BOT_TOKEN is', process.env.BOT_TOKEN ? 'DEFINED' : 'UNDEFINED');



  // API routes
  app.use(apiApp);

  // Start Telegram Bot
  if (process.env.BOT_TOKEN) {
    bot.launch()
      .then(() => console.log('Bot de Telegram iniciado'))
      .catch((err) => console.error('Error al iniciar el Bot de Telegram:', err));
  } else {
    console.warn('BOT_TOKEN no configurado. El bot no se iniciará.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de API y Bot corriendo en http://localhost:${PORT}`);
  });
}

startServer();

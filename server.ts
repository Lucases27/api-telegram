import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import apiApp from './server/api/server';
import bot from './server/bot/bot';
import db from './server/src/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('GEMINI_API_KEY is', process.env.GEMINI_API_KEY ? 'DEFINED' : 'UNDEFINED');
  console.log('BOT_TOKEN is', process.env.BOT_TOKEN ? 'DEFINED' : 'UNDEFINED');

  // Run migrations
  try {
    console.log('Ejecutando migraciones...');
    const existsRestaurants = await db.schema.hasTable('restaurants');
    if (!existsRestaurants) {
      await db.schema.createTable('restaurants', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
      });
      console.log('Tabla restaurants creada');
      
      // Seed restaurants
      await db('restaurants').insert([
        { name: 'Restaurante A' },
        { name: 'Restaurante B' },
        { name: 'Restaurante C' }
      ]);
      console.log('Restaurantes insertados');
    }

    const existsReservations = await db.schema.hasTable('reservations');
    if (!existsReservations) {
      await db.schema.createTable('reservations', (table) => {
        table.increments('id').primary();
        table.integer('restaurantId').unsigned().references('id').inTable('restaurants').onDelete('CASCADE');
        table.string('name').notNullable();
        table.date('date').notNullable();
        table.timestamp('createdAt').defaultTo(db.fn.now());
      });
      console.log('Tabla reservations creada');
    }
  } catch (err) {
    console.error('Error en la base de datos:', err);
  }

  // API routes
  app.use(apiApp);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  // Start Telegram Bot
  if (process.env.BOT_TOKEN) {
    bot.launch()
      .then(() => console.log('Bot de Telegram iniciado'))
      .catch((err) => console.error('Error al iniciar el Bot de Telegram:', err));
  } else {
    console.warn('BOT_TOKEN no configurado. El bot no se iniciará.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();

// Script para crear tablas de restaurantes y reservas usando Knex
const db = require('./src/db');

async function migrate() {
  // Crear tabla de restaurantes
  const existsRestaurants = await db.schema.hasTable('restaurants');
  if (!existsRestaurants) {
    await db.schema.createTable('restaurants', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
    });
    console.log('Tabla restaurants creada');
  }

  // Crear tabla de reservas
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

  await db.destroy();
}

migrate();

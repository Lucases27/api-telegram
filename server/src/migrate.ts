import db from './db';

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

  // Crear tabla de usuarios
  const existsUsers = await db.schema.hasTable('users');
  if (!existsUsers) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('firebaseUid').notNullable().unique();
      table.string('email').notNullable().unique();
      table.string('name').notNullable();
      table.string('role').notNullable().defaultTo('customer');
      table.timestamp('createdAt').defaultTo(db.fn.now());
    });
    console.log('Tabla users creada');
  }

  // Crear tabla de reservas (con userId)
  const existsReservations = await db.schema.hasTable('reservations');
  if (!existsReservations) {
    await db.schema.createTable('reservations', (table) => {
      table.increments('id').primary();
      table.integer('restaurantId').unsigned().references('id').inTable('restaurants').onDelete('CASCADE');
      table.integer('userId').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable();
      table.string('name').notNullable();
      table.date('date').notNullable();
      table.timestamp('createdAt').defaultTo(db.fn.now());
    });
    console.log('Tabla reservations creada');
  } else {
    // Add userId column if it doesn't exist yet (for existing DBs)
    const hasUserId = await db.schema.hasColumn('reservations', 'userId');
    if (!hasUserId) {
      await db.schema.alterTable('reservations', (table) => {
        table.integer('userId').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable();
      });
      console.log('Columna userId agregada a reservations');
    }
  }

  await db.destroy();
}

migrate();

// Seed de restaurantes para SQLite
const db = require('./src/db');

const seedRestaurants = async () => {
  const count = await db('restaurants').count('id as count').first();
  if (count.count === 0) {
    await db('restaurants').insert([
      { name: 'Restaurante A' },
      { name: 'Restaurante B' },
      { name: 'Restaurante C' }
    ]);
    console.log('Restaurantes insertados');
  } else {
    console.log('Restaurantes ya existen, no se insertan duplicados');
  }
  await db.destroy();
};

seedRestaurants();

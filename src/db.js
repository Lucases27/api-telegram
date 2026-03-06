// Configuración de Knex para SQLite
const knex = require('knex');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './data/database.sqlite3'
  },
  useNullAsDefault: true
});

module.exports = db;

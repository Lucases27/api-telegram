import knex from 'knex';
import path from 'path';

const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: path.join(process.cwd(), 'data', 'database.sqlite3')
  },
  useNullAsDefault: true
});

export default db;

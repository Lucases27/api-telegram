import db from './src/db.ts';

async function main() {
  const users = await db('users').select('id', 'email', 'role');
  if (users.length === 0) {
    console.log('No hay usuarios registrados todavía. Registrate primero desde http://localhost:5173/register');
  } else {
    console.log('Usuarios registrados:');
    console.table(users);
  }
  await db.destroy();
}

main();

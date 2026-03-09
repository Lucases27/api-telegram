import db from './src/db.ts';

const email = process.argv[2];
if (!email) {
  console.error('Uso: npx tsx make-admin.ts <email>');
  process.exit(1);
}

async function main() {
  const count = await db('users').where({ email }).update({ role: 'admin' });
  if (count) {
    console.log(`✅ Usuario ${email} ahora es ADMIN.`);
  } else {
    console.log(`❌ No se encontró ningún usuario con email: ${email}`);
    console.log('Asegurate de haberte registrado primero desde http://localhost:5173/register');
  }
  await db.destroy();
}

main();

import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import db from '../db.ts';

const bot = new Telegraf(process.env.BOT_TOKEN || '');
const API_URL = 'http://localhost:3001/api';

// In-memory store: chatId -> { firebaseUid, idToken }
const linkedUsers = new Map<number, { userId: number; name: string; role: string; idToken: string }>();

// Refresh token helper via Firebase REST API
async function getFirebaseToken(email: string, password: string): Promise<string> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) throw new Error('VITE_FIREBASE_API_KEY no está definida en el .env');
  const res = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    { email, password, returnSecureToken: true }
  );
  return res.data.idToken;
}

bot.start((ctx) => {
  ctx.reply(
    '¡Bienvenido! \nUsa /vincular <email> <password> para conectar tu cuenta, /restaurants para ver los restaurantes, /reserve para reservar, /reservations para ver tus reservas y /chat <mensaje> para hablar con la IA.',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('Ver Restaurantes', 'show_restaurants'),
        Markup.button.callback('Ver Reservas', 'show_reservations')
      ],
      [
        Markup.button.callback('Reservar', 'make_reservation'),
        Markup.button.callback('Chat con IA', 'start_chat')
      ]
    ])
  );
});

bot.command('vincular', async (ctx) => {
  const parts = ctx.message.text.split(' ');
  if (parts.length < 3) {
    return ctx.reply('Uso: /vincular <email> <password>\nEj: /vincular maria@ejemplo.com micontraseña123');
  }
  const email = parts[1];
  const password = parts[2];
  const chatId = ctx.chat.id;

  try {
    ctx.reply('Verificando credenciales...');
    const idToken = await getFirebaseToken(email, password);

    // Get user profile from backend
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    const user = meRes.data;

    linkedUsers.set(chatId, {
      userId: user.id,
      name: user.name,
      role: user.role,
      idToken
    });

    ctx.reply(`✅ Cuenta vinculada exitosamente!\n👤 Nombre: ${user.name}\n🔑 Rol: ${user.role}\n\nAhora tus comandos estarán autenticados.`);
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || 'Error desconocido';
    ctx.reply(`❌ No se pudo vincular la cuenta: ${msg}\nAsegurate de que el email y contraseña sean correctos y de haber completado el registro desde la web.`);
  }
});

bot.command('desvincular', (ctx) => {
  const chatId = ctx.chat.id;
  if (linkedUsers.has(chatId)) {
    const linked = linkedUsers.get(chatId)!;
    linkedUsers.delete(chatId);
    ctx.reply(`✅ Cuenta de ${linked.name} desvinculada correctamente.`);
  } else {
    ctx.reply('No tenés ninguna cuenta vinculada.');
  }
});

function getAuthHeaders(chatId: number): Record<string, string> | null {
  const linked = linkedUsers.get(chatId);
  if (!linked) return null;
  return { Authorization: `Bearer ${linked.idToken}` };
}

bot.command('restaurants', async (ctx) => {
  const headers = getAuthHeaders(ctx.chat.id);
  if (!headers) return ctx.reply('⚠️ Necesitás vincular tu cuenta primero. Usá /vincular <email> <password>');
  try {
    const res = await axios.get(`${API_URL}/restaurants`, { headers });
    const list = res.data.map((r: any) => `${r.id}. ${r.name}`).join('\n');
    ctx.reply('Restaurantes disponibles:\n' + list);
  } catch (err) {
    ctx.reply('Error al obtener restaurantes.');
  }
});

bot.command('reservations', async (ctx) => {
  const headers = getAuthHeaders(ctx.chat.id);
  if (!headers) return ctx.reply('⚠️ Necesitás vincular tu cuenta primero. Usá /vincular <email> <password>');
  try {
    const res = await axios.get(`${API_URL}/reservations`, { headers });
    if (res.data.length === 0) return ctx.reply('No hay reservas registradas.');
    const list = res.data
      .map((r: any) => `#${r.id} - ${r.name} en ${r.restaurantName || `restaurante ${r.restaurantId}`} el ${r.date}`)
      .join('\n');
    ctx.reply('Reservas registradas:\n' + list);
  } catch (err) {
    ctx.reply('Error al obtener reservas.');
  }
});

bot.command('chat', async (ctx) => {
  const message = ctx.message.text.split(' ').slice(1).join(' ');
  if (!message) return ctx.reply('Por favor, escribí un mensaje después del comando /chat. Ej: /chat Quiero reservar en Restaurante A');
  
  const headers = getAuthHeaders(ctx.chat.id);
  if (!headers) return ctx.reply('⚠️ Necesitás vincular tu cuenta primero. Usá /vincular <email> <password>');
  
  try {
    const res = await axios.post(`${API_URL}/chat`, { message }, { headers });
    ctx.reply(res.data.reply);
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || 'Error al conectar con el chat de IA.';
    ctx.reply(`Error: ${errorMsg}`);
  }
});

bot.hears(/^\/reserve\s+(\d+)\s+(\d{4}-\d{2}-\d{2})\s+(.+)$/i, async (ctx) => {
  const headers = getAuthHeaders(ctx.chat.id);
  if (!headers) return ctx.reply('⚠️ Necesitás vincular tu cuenta primero. Usá /vincular <email> <password>');
  const restaurantId = parseInt(ctx.match[1], 10);
  const date = ctx.match[2];
  const name = ctx.match[3];
  try {
    const res = await axios.post(`${API_URL}/reservations`, { restaurantId, name, date }, { headers });
    ctx.reply(res.data.message);
  } catch (err) {
    ctx.reply('No se pudo crear la reserva. Verifica el restaurante, la fecha (YYYY-MM-DD) y el formato.');
  }
});

bot.command('reserve', async (ctx) => {
  ctx.reply('Para reservar, enviá:\n/reserve <restaurantId> <YYYY-MM-DD> <tu_nombre>\nEj: /reserve 1 2026-03-05 Lucas');
});

// Callbacks para los botones inline
bot.action('show_restaurants', async (ctx) => {
  const headers = getAuthHeaders(ctx.chat!.id);
  if (!headers) { await ctx.answerCbQuery(); return ctx.reply('⚠️ Vinculá tu cuenta con /vincular'); }
  try {
    const res = await axios.get(`${API_URL}/restaurants`, { headers });
    const list = res.data.map((r: any) => `${r.id}. ${r.name}`).join('\n');
    await ctx.answerCbQuery();
    ctx.reply('Restaurantes disponibles:\n' + list);
  } catch (err) {
    ctx.reply('Error al obtener restaurantes.');
  }
});

bot.action('show_reservations', async (ctx) => {
  const headers = getAuthHeaders(ctx.chat!.id);
  if (!headers) { await ctx.answerCbQuery(); return ctx.reply('⚠️ Vinculá tu cuenta con /vincular'); }
  try {
    const res = await axios.get(`${API_URL}/reservations`, { headers });
    await ctx.answerCbQuery();
    if (res.data.length === 0) {
      return ctx.reply('No hay reservas registradas.');
    }
    const list = res.data
      .map((r: any) => `#${r.id} - ${r.name} en ${r.restaurantName || `restaurante ${r.restaurantId}`} el ${r.date}`)
      .join('\n');
    ctx.reply('Reservas registradas:\n' + list);
  } catch (err) {
    ctx.reply('Error al obtener reservas.');
  }
});

bot.action('make_reservation', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply('Para reservar, enviá:\n/reserve <restaurantId> <YYYY-MM-DD> <tu_nombre>\nEj: /reserve 1 2026-03-05 Lucas');
});

bot.action('start_chat', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply('Usa el comando /chat seguido de tu mensaje para hablar con la IA. Ej: /chat ¿Qué restaurantes hay?');
});

export default bot;

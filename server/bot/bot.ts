import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';

const bot = new Telegraf(process.env.BOT_TOKEN || '');
const API_URL = 'http://localhost:3000/api';

bot.start((ctx) => {
	ctx.reply(
		'¡Bienvenido! \nUsa /restaurants para ver los restaurantes, /reserve para reservar, /reservations para ver tus reservas y /chat <mensaje> para hablar con la IA.',
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

bot.command('restaurants', async (ctx) => {
	try {
		const res = await axios.get(`${API_URL}/restaurants`);
		const list = res.data.map((r: any) => `${r.id}. ${r.name}`).join('\n');
		ctx.reply('Restaurantes disponibles:\n' + list);
	} catch (err) {
		ctx.reply('Error al obtener restaurantes.');
	}
});

bot.command('reservations', async (ctx) => {
	try {
		const res = await axios.get(`${API_URL}/reservations`);
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
  if (!message) return ctx.reply('Por favor, escribe un mensaje después del comando /chat. Ej: /chat Quiero reservar en Restaurante A');
  
  try {
    const res = await axios.post(`${API_URL}/chat`, { message });
    ctx.reply(res.data.reply);
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || 'Error al conectar con el chat de IA.';
    ctx.reply(`Error: ${errorMsg}`);
  }
});

bot.hears(/^\/reserve\s+(\d+)\s+(\d{4}-\d{2}-\d{2})\s+(.+)$/i, async (ctx) => {
	const restaurantId = parseInt(ctx.match[1], 10);
	const date = ctx.match[2];
	const name = ctx.match[3];
	try {
		const res = await axios.post(`${API_URL}/reservations`, { restaurantId, name, date });
		ctx.reply(res.data.message);
	} catch (err) {
		ctx.reply('No se pudo crear la reserva. Verifica el restaurante, la fecha (YYYY-MM-DD) y el formato.');
	}
});

bot.command('reserve', async (ctx) => {
	ctx.reply('Para reservar, envía:\n/reserve <restaurantId> <YYYY-MM-DD> <tu_nombre>\nEj: /reserve 1 2026-03-05 Lucas');
});

// Callbacks para los botones inline
bot.action('show_restaurants', async (ctx) => {
	try {
		const res = await axios.get(`${API_URL}/restaurants`);
		const list = res.data.map((r: any) => `${r.id}. ${r.name}`).join('\n');
		await ctx.answerCbQuery();
		ctx.reply('Restaurantes disponibles:\n' + list);
	} catch (err) {
		ctx.reply('Error al obtener restaurantes.');
	}
});

bot.action('show_reservations', async (ctx) => {
	try {
		const res = await axios.get(`${API_URL}/reservations`);
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
	ctx.reply('Para reservar, envía:\n/reserve <restaurantId> <YYYY-MM-DD> <tu_nombre>\nEj: /reserve 1 2026-03-05 Lucas');
});

bot.action('start_chat', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply('Usa el comando /chat seguido de tu mensaje para hablar con la IA. Ej: /chat ¿Qué restaurantes hay?');
});

export default bot;

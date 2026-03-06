require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);


const axios = require('axios');
const API_URL = 'http://localhost:3000';

bot.start((ctx) => {
	ctx.reply(
		'¡Bienvenido! \nUsa /restaurants para ver los restaurantes, /reserve para reservar y /reservations para ver tus reservas.',
		Markup.inlineKeyboard([
			[
				Markup.button.callback('Ver Restaurantes', 'show_restaurants'),
				Markup.button.callback('Ver Reservas', 'show_reservations')
			],
			[
				Markup.button.callback('Reservar', 'make_reservation')
			]
		])
	);
});

bot.command('restaurants', async (ctx) => {
	try {
		const res = await axios.get(`${API_URL}/restaurants`);
		const list = res.data.map(r => `${r.id}. ${r.name}`).join('\n');
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
			.map(r => `#${r.id} - ${r.name} en ${r.restaurantName || `restaurante ${r.restaurantId}`} el ${r.date}`)
			.join('\n');
		ctx.reply('Reservas registradas:\n' + list);
	} catch (err) {
		ctx.reply('Error al obtener reservas.');
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

bot.launch();

// Callbacks para los botones inline
bot.action('show_restaurants', async (ctx) => {
	try {
		const res = await axios.get(`${API_URL}/restaurants`);
		const list = res.data.map(r => `${r.id}. ${r.name}`).join('\n');
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
			.map(r => `#${r.id} - ${r.name} en ${r.restaurantName || `restaurante ${r.restaurantId}`} el ${r.date}`)
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

console.log('Bot de Telegram iniciado');

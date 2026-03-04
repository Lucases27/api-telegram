require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);


const axios = require('axios');
const API_URL = 'http://localhost:3000';

bot.start((ctx) => {
	ctx.reply('¡Bienvenido! Usa /restaurants para ver los restaurantes, /reserve para reservar y /reservations para ver tus reservas.');
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
		const list = res.data.map(r => `#${r.id} - ${r.name} en restaurante ${r.restaurantId} a las ${r.turno}`).join('\n');
		ctx.reply('Reservas registradas:\n' + list);
	} catch (err) {
		ctx.reply('Error al obtener reservas.');
	}
});

bot.hears(/^\/reserve (\d+) (.+)$/i, async (ctx) => {
	const restaurantId = parseInt(ctx.match[1]);
	const name = ctx.match[2];
	try {
		const res = await axios.post(`${API_URL}/reservations`, { restaurantId, name });
		ctx.reply(res.data.message);
	} catch (err) {
		ctx.reply('No se pudo crear la reserva. Verifica el restaurante y el formato.');
	}
});

bot.command('reserve', async (ctx) => {
	ctx.reply('Para reservar, envía el comando en el siguiente formato:\n/reserve <restaurantId> <tu_nombre>\nEjemplo: /reserve 1 Juan');
});

bot.launch();

console.log('Bot de Telegram iniciado');

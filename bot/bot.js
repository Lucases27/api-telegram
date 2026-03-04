require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('¡Bot funcionando correctamente!'));

bot.launch();

console.log('Bot de Telegram iniciado');

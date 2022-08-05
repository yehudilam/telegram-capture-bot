require('dotenv').config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const url = process.env.WEBHOOK_URL;
const port = process.env.PORT;

const {router} = require("./router");
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const { insertUser, unsubscribeUser } = require('./hko/weather-warning2/userList');

const { tdCam } = require('./td/tdCam');

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${ url }/bot${ TOKEN }`);

const app = express();

// parse the updates to JSON
app.use(bodyParser.json());

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express Server
app.listen(port, async () => {
    console.log(`Express server is listening on ${ port }, checking webhook...`);
});

bot.onText(/\/([^_\s]*)_*([^bot]*)(@captureinfo2_bot)*$/g, async (msg, match) => {
    await router(msg, match, false);
});

bot.onText(/\/subscribe(\s*.*)/, (msg, match) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `Thank you for subscribing, you will receive HKO weather warning from now on.`);

    // add user to chat list:
    insertUser({
        chat_id: chatId,
        username: msg.chat.username
    });
});

bot.onText(/\/unsubscribe(\s*.*)/, (msg, match) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'You have been removed from the HKO weather warning push list.');

    // set user to inactive
    unsubscribeUser({
        chat_id: chatId
    });
});

bot.onText(/\/td_cam(?:_*(.*))/, async(msg, match) => {
    const chatId = msg.chat.id;

    await tdCam(match, chatId);
});

// match here instead of callback_query
bot.onText(/\/bbi(.*)/, async (msg, match) => {
    // await getKmbBbi(match, chatId);
});

bot.on("callback_query", async (callbackQuery) => {
    const { message, data } = callbackQuery;
    const match = /([^_\s]*)_*(.*)/.exec(data);

    await router(message, match, true);
});

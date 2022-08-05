const fetch = require('node-fetch');
const { telegramPaths } = require('./../config/telegramPaths');
const { replyLocationKeyboard, locationKeyboardCallback } = require('./../hko/weather-photo/replyLocationKeyboard');

require('dotenv').config()

// weather photo inline keyboard:
async function sendInlineKeyboard(options) {
    const url = telegramPaths({
        token: process.env.TELEGRAM_TOKEN
    }).sendMessage;

    const inlineKeyboard = await replyLocationKeyboard();

    const body = {
        chat_id: options.chatId,
        text: options.text,
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    return response.json();
}

async function inlineKeyboardWithCallback(options) {
    const url = telegramPaths({
        token: process.env.TELEGRAM_TOKEN
    }).sendMessage;

    const body = {
        chat_id: options.chatId,
        text: options.text,
        reply_markup: {
            inline_keyboard: options.inlineKeyboard
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    return response.json();
}


async function updateInlineKeyboardWithCallback(options) {
    const { inlineKeyboard, messageId, text, chatId } = options;

    let url;
    let body = {
        chat_id: chatId,
        text,
        reply_markup: {
            inline_keyboard: inlineKeyboard
        },
    };

    if (messageId) {
        // is update
        url = telegramPaths({
            token: process.env.TELEGRAM_TOKEN
        }).editMessageText;

        body = {
            ...body,
            message_id: messageId,
        };

    } else {
        // send a new message
        url = telegramPaths({
            token: process.env.TELEGRAM_TOKEN
        }).sendMessage;

    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    return response.json();
}

module.exports = {
    sendInlineKeyboard,
    inlineKeyboardWithCallback,
    updateInlineKeyboardWithCallback
};


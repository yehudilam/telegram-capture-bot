const {telegramPaths} = require("../config/telegramPaths");
const fetch = require('node-fetch');
const formData = require('form-data');
const fs = require("fs");
// const path = require('path');

require('dotenv').config();

async function sendMessage(body) {
    const url = telegramPaths({
        token: process.env.TELEGRAM_TOKEN
    }).sendMessage;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body),
    });

    return response.json();
}

async function sendSticker(params) {
    const url = telegramPaths({
        token: process.env.TELEGRAM_TOKEN,
    }).sendSticker;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    return response.json();
}

async function sendPhoto(photo, chatId, options) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`;

    const form = new formData();
    if (chatId) {
        return;        
    } 
    form.append('chat_id', chatId);

    if (options && options.filename) {
        form.append('photo', photo, {
            filename: options.filename
        });
    } else {
        form.append('photo', photo, {
            filename: 'radar.jpg'
        });
    }

    if (options && options.caption) {
        form.append('caption', options.caption);
    }

    const response = await fetch(url, {
        method: 'POST',
        body: form
    })

    return response.json();
}

function getImage(fullPath) {
    return new Promise(async (resolve) => {
        fs.readFile(fullPath, function (err, data) {
            if (err) {
                console.log(err);
            }

            resolve(data);
        });
    })
}

async function sendPhotoByUrl(imagePath, chatId) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`;


    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            photo: imagePath
        })
    })

    return response.json();
}

async function sendPhotoByPath(params) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`;

    const form = new formData();
    const radarImage = await getImage(params.fullPath);

    if (params.filename) {
        form.append('photo', radarImage, {
            filename: params.filename
        });
    } else {
        form.append('photo', radarImage, {
            filename: 'radar.jpg'
        });
    }
    form.append('chat_id', params.chatId);

    const response = await fetch(url, {
        method: 'POST',
        body: form
    });

    return response.text();
}

async function sendAnimation(chatId, video) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendAnimation`;

    const form = new formData();

    form.append('animation', video, {
        filename: 'radar.mp4'
    });
    form.append('chat_id', chatId);

    const response = await fetch(url, {
        method: 'POST',
        body: form
    })

    return response.text();
}

function readVideo(path) {
    return new Promise(async (resolve) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                console.log(err);
            }

            resolve(data);
        })
    })
}

async function sendVideoByPath(chatId, videoPath) {
    const video = await readVideo(videoPath);

    return sendAnimation(chatId, video);
}

module.exports = {
    sendMessage,
    sendSticker,
    sendPhoto,
    sendPhotoByPath,
    sendPhotoByUrl,
    sendAnimation,
    sendVideoByPath
};

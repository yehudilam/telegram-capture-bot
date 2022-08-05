const fetch = require('node-fetch');
const { sendPhoto } = require('../telegram/sendMessage');

// http://tdcctv.data.one.gov.hk/H429F.JPG

async function getTrafficCamPhoto(key) {
    const response = await fetch(`http://tdcctv.data.one.gov.hk/${key}.JPG`);
    let blob = {};
    if (response.ok) {
        blob = await response.buffer();
    }

    return blob;
}

async function sendTrafficPhoto(chatId, { key, description }) {
    const photo = await getTrafficCamPhoto(key);

    let options = {
        filename: `${key}.jpg`
    };

    if (description) {
        options = {
            ...options,
            caption: description,
        };
    }

    await sendPhoto(photo, chatId, options);
}

module.exports = {
    sendTrafficPhoto,
};

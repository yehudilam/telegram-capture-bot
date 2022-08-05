const fetch = require('node-fetch');
const { sendPhoto } = require('./../../telegram/sendMessage');
const { weatherPhoto } = require('./../../config/hkoPaths');

async function getPhotoBuffer(url){
    const response = await fetch(url);
        let blob = {};
        if(response.ok){
            blob = await response.buffer();
        }

        return blob;
}

async function sendWeatherPhoto(param){
    const weatherPhotoUrl = weatherPhoto(param.location_code);
        const photo = await getPhotoBuffer(weatherPhotoUrl);

        let options = {
            filename: `${ param.location_code }.jpg`
        };

        if(param.caption){
            options = {
                ...options,
                caption: param.caption,
            };
        }

        await sendPhoto(photo, param.chatId, options);
}

module.exports = {
    sendWeatherPhoto
};

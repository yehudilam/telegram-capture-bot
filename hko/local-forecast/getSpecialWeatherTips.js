const {sendMessage} = require("../../telegram/sendMessage");
const moment = require('moment');
const fetch = require('node-fetch');

const specialWeatherTipsUrl = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=swt&lang=tc';

async function getSpecialWeatherTips(chatId){
    const response = await fetch(specialWeatherTipsUrl);
    const json = await response.json();

    const { swt } = json;

    if(!swt || swt.length === 0){
        return sendMessage({
            chat_id: chatId,
            text: 'No special weather tips available',
        });
    }

    const message = swt.reduce((acc, { desc, updateTime}) => {
        const timestamp = moment(updateTime, 'YYYY-MM-DD[T]HH:mm:ssZZ');

        return `${acc}
        ${desc} (${timestamp.format('YYYY-MM-DD HH:mm:ss')})
        `;
    }, '');

    return sendMessage({
        chat_id: chatId,
        text: message,
    });
}

module.exports = {
    getSpecialWeatherTips,
};

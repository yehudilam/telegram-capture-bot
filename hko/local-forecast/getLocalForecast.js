const fetch = require('node-fetch');
const moment = require('moment');
const {sendMessage} = require("../../telegram/sendMessage");

const localWeatherForecastUrl = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=tc';

async function getLocalForecast(chatId){
    const response = await fetch(localWeatherForecastUrl);
    const json = await response.json();

    const {
        generalSituation,
        tcInfo,
        fireDangerWarning,
        forecastPeriod,
        forecastDesc,
        outlook,
        updateTime,
    } = json;

    const timestamp = moment(updateTime, 'YYYY-MM-DD[T]HH:mm:ssZZ');

    const forecastMessage = `${generalSituation}
${tcInfo}
${fireDangerWarning}
${forecastPeriod}: ${forecastDesc}
${outlook}
${timestamp.format('YYYY-MM-DD HH:mm:ss')}`;

    return sendMessage({
        chat_id: chatId,
        text: forecastMessage,
    })
}

module.exports = {
    getLocalForecast,
}

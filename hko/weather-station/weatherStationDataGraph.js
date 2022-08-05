const moment = require('moment');
const fetch = require('node-fetch');
const {sendPhoto} = require("../../telegram/sendMessage");
const {dataTypeNameMap} = require("./weatherStationKeyboard");
const { getPool } = require('../../helpers/mysql');

async function weatherStationDataSeries({
    chatId,
    dataType,
    stationCode,
}){
    if(stationCode === 'overview'){
        return sendOverview({
           chatId, dataType,
        });
    }

    // get url from DB
    const stations = await getStationDataUrl({
        dataType, stationCode,
    });

    if(!stations || stations.length === 0){
        return;
    }

    const station = stations[0];

    return sendDataGraph({
        chatId,
        stationCode,
        dataType,
        stationName: station.name,
        url: station.url,
    });

}

// todo: extract to constants
const overviewDataTypeMap = {
    temp: 'temp/temp',

    // wind related
    // 10-min mean gust
    gust: 'windgust/gust',
    // windbarb
    wind: 'wind',

    windDirection: '', // not used

    // humid
    visibility: 'vis/vis',
    solarRadiation: '',
};

// https://www.hko.gov.hk/wxinfo/ts/windbarb/shahrwind.png

async function sendOverview({
    chatId, dataType,
}){
    const photo = await getDataGraphImage(`https://www.hko.gov.hk/wxinfo/ts/${overviewDataTypeMap[dataType]}chk.png`);

    const options = {
        filename: `${dataType}-overview`,
        caption: `${dataType}-overview`,
    };

    return sendPhoto(photo, chatId, options);
}

async function sendDataGraph({
    chatId, stationCode, dataType, stationName, url,
}){
    const photo = await getDataGraphImage(url);

    const options = {
        filename: `${stationCode}-${dataType}-${moment().format('YYYYMMDDHHmmss')}.jpg`,
        caption: `${stationName} - ${dataTypeNameMap[dataType]}`,
    };

    return sendPhoto(photo, chatId, options);
}

function getDataGraphImage(url){
    return new Promise(async resolve => {
        const response = await fetch(url);
        let blob = {};

        if(response.ok){
            blob = await response.buffer();
        }

        resolve(blob);
    });
}

function getStationDataUrl({
    dataType,
    stationCode,
}){
    return new Promise(async resolve => {
        const pool = getPool();

        pool.query("SELECT * FROM weather_station where station_type=? and station=?", [dataType, stationCode], async(err, data) => {
            if(err){
                console.log(err);
            }

            resolve(data);
        });
    });
}

module.exports = {
    weatherStationDataSeries,
};

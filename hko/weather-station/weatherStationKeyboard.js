const {updateInlineKeyboardWithCallback} = require("../../telegram/keyboard");
const _ = require('lodash');
const { getPool } = require('../../helpers/mysql');

async function dataTypeKeyboard({
    chatId, messageId
}){
    const dataTypes = await getListOfDataTypes();

    const dataTypesWithName = dataTypes.map(({ station_type: stationType }) => {
        return {
            text: dataTypeNameMap[stationType],
            callback_data: `weatherstation_${stationType}`,
        };
    });

    const chunkedMenu = _.chunk([
        ...dataTypesWithName,
        {
            text: "Back",
            callback_data: 'main',
        },
    ], 2);

    await updateInlineKeyboardWithCallback({
        chatId,
        messageId,
        text: "Please choose a weather data type",
        inlineKeyboard: chunkedMenu,
    });
}

async function stationKeyboard({
    dataType,
    chatId, messageId,
}){
    const stations = await getGetListOfStations(dataType);

    let overviewItems = [
        {
            text: 'Overview',
            callback_data: `weatherstation_${dataType}_overview`,
        },
    ];

    if(dataType === 'wind'){
        overviewItems = [
            // windbarb
            {
                text: 'Overview',
                callback_data: `weatherstation_wind_overview`,
            },
            // 10-min mean gust
            {
                text: 'Max Gust',
                callback_data: `weatherstation_gust_overview`,
            }
        ]
    }

    const chunkedMenu = _.chunk([
        ...overviewItems,
        ...stations.map(station => {
            return {
                text: station.name,
                callback_data: `weatherstation_${dataType}_${station.station}`,
            };
        }),
        {
            text: "Back",
            callback_data: `weatherstation`,
        },
    ], 3);

    await updateInlineKeyboardWithCallback({
        chatId,
        messageId,
        text: "Please choose a weather station",
        inlineKeyboard: chunkedMenu,
    });
}

const dataTypeNameMap = {
    temp: 'Temperature',
    wind: 'Wind',
    visibility: 'Visibility',
    solarRadiation: 'Solar Radiation',
};

function getListOfDataTypes(){
    return new Promise(async resolve => {
        const pool = getPool();

        pool.query("SELECT station_type FROM weather_station group by station_type", async(err, data) => {
            if(err){
                console.log(err);
            }

            resolve(data);
        });
    });
}

function getGetListOfStations(dataType){
    return new Promise(async resolve => {
        const pool = getPool();

        pool.query("SELECT * FROM weather_station where station_type=?", [dataType], async(err, data) => {
            if(err){
                console.log(err);
            }

            resolve(data);
        });
    });
}

module.exports = {
    dataTypeKeyboard,
    stationKeyboard,
    dataTypeNameMap
};

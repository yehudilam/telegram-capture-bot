const {dataTypeKeyboard, dataTypeNameMap, stationKeyboard} = require("./weatherStationKeyboard");
const {weatherStationDataSeries} = require("./weatherStationDataGraph");

// weather_photo
//  - menu
//  - <datatype>
//    - <station-code>

async function weatherStation(match, { chatId, messageId }){
    const pathParams = /([^_]*)_*([^_]*)/.exec(match[2]);

    if(!pathParams || (pathParams && pathParams[1] === 'menu') || pathParams[1] === ''){
        // return data type
        return dataTypeKeyboard({
            chatId, messageId,
        });

    }else if(pathParams[2] !== ''){
        // get data series graph
        return weatherStationDataSeries({
            chatId,
            dataType: pathParams[1],
            stationCode: pathParams[2],
        });

    }else if (
        Object
            .keys(dataTypeNameMap)
            .findIndex(x => x === pathParams[1]) !== -1
    ){
        // return station list
        return stationKeyboard({
            chatId,
            messageId,
            dataType: pathParams[1],
        });
    }

}

module.exports = {
    weatherStation,
};

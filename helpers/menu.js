const _ = require('lodash');

/*
Help: (/home)
Radar > range
Radar animation > range
Weather photo > stations
Traffic
Traffic Cam > region > camera by region


two in a row

callback data same as command

 */

function mainMenu(){
    const buttons = [
        {
            text: "Radar",
            callback_data: 'radar_menu',
        },
        {
            text: "Radar Animation",
            callback_data: 'radara_menu',
        },
        {
            text: "Weather Photo",
            callback_data: 'weatherphoto_menu',
        },
        {
            text: 'Weather graph',
            callback_data: 'weatherstation_menu',
        },
        {
            text: 'Traffic News',
            callback_data: 'traffic',
        },
        {
            text: 'Traffic Camera',
            callback_data: 'tdcam',
        },
        {
            text: "Satellite image",
            callback_data: 'satimage',
        }
    ];

    return _.chunk(buttons, 2);

}

function radaraMenuWithBack(){
    const buttons = [
        {
            text: "64km 10-frames",
            callback_data: "radara_64_10",
        },
        {
            text: '256km 10-frames',
            callback_data: 'radara_256_10',
        },
        {
            text: '64km 20-frames',
            callback_data: 'radara_64_20',
        },
        {
            text: '256km 20-frames',
            callback_data: 'radara_256_20',
        },
        {
            text: 'Back',
            callback_data: 'main',
        },
    ];

    return _.chunk(buttons, 2);
}


module.exports = {
    mainMenu,
    radaraMenuWithBack,
};

const { getPool } = require('../helpers/mysql');
const _ = require('lodash');
const {telegramPaths} = require("../config/telegramPaths");
const fetch = require('node-fetch');

// all regions
// regions
// region > cam/subregions
// subregion > cam

// all regions
function getListOfRegions() {
    return new Promise(async resolve => {
        const pool = getPool();

        pool.query("SELECT DISTINCT region FROM info.td_traffic_camera", async (err, data) => {
            if (err) {
                console.log(err);
            }

            resolve(data);

        });
    });
}

// camera and subreginos
function getListOfCameraByRegion(region) {
    return new Promise(async resolve => {
        const pool = getPool();

        pool.query("SELECT * FROM info.td_traffic_camera WHERE region = ?", [region], async (err, data) => {
            if (err) {
                console.log(err);
            }

            resolve(data);
        });
    });
}

async function regionMenu(chatId, isUpdateMessage = false, messageId) {
    const regions = await getListOfRegions();

    const regionKeyboard = regions.map(({ region }) => {
        return {
            text: region,
            callback_data: `tdcam_region_${region}`,
        }
    });

    const chunkedMenu = _.chunk([
        ...regionKeyboard,
        {
            text: "Back",
            callback_data: 'main',
        },
    ], 3);

    let body = {
        chat_id: chatId,
        text: "Please choose a region for TD traffic cameras",
        reply_markup: {
            inline_keyboard: chunkedMenu
        },
    };

    let url;
    if (isUpdateMessage && messageId) {
        url = telegramPaths({
            token: process.env.TELEGRAM_TOKEN
        }).editMessageText;

        if (messageId) {
            body = {
                ...body,
                message_id: messageId,
            };
        }
    } else {
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

function getListOfCameraBySubregion(region, subregion) {
    return new Promise(async resolve => {
        const pool = getPool();

        pool.query(
            "SELECT * FROM info.td_traffic_camera WHERE region = ? AND subregion=?",
            [region, subregion],
            async (err, data) => {
                if (err) {
                    console.log(err);
                }

                resolve(data);
            });
    });
}

async function subregionMenu(chatId, region, subregion, isUpdateMessage = false, messageId) {
    const subregions = await getListOfCameraBySubregion(region, subregion);

    const keyboard = subregions
        .map(({ description, camera_key }) => {
            return {
                text: description,
                callback_data: `tdcam_camera_${camera_key}`,
            };
        });

    // back button: back to all regions
    keyboard.push({
        text: 'Back',
        callback_data: `tdcam_menu`,
    });

    const chunkedMenu = _.chunk(keyboard, 2);

    // todo: extract
    let body = {
        chat_id: chatId,
        text: "Please choose a TD traffic camera",
        reply_markup: {
            inline_keyboard: chunkedMenu
        },
    };

    // todo: duplicate snippets
    let url;
    if (isUpdateMessage && messageId) {
        url = telegramPaths({
            token: process.env.TELEGRAM_TOKEN
        }).editMessageText;

        if (messageId) {
            body = {
                ...body,
                message_id: messageId,
            };
        }
    } else {
        url = telegramPaths({
            token: process.env.TELEGRAM_TOKEN
        }).sendMessage;
    }

    // const response =
    await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body)
    });
}

// camera and subregions
async function cameraInRegionMenu(chatId, region, isUpdateMessage = false, messageId) {
    const regions = await getListOfCameraByRegion(region);

    const unique = regions.reduce((acc, cur) => {
        const { subregion, camera_key } = cur;
        if (!subregion) {
            return {
                ...acc,
                [camera_key]: {
                    ...cur,
                    type: 'camera',
                },
            };
        }

        if (!acc[subregion]) {
            return {
                ...acc,
                [subregion]: {
                    description: subregion,
                    camera_key: subregion,
                    type: 'subregion',
                },
            };
        }

        return acc;
    }, {});

    const regionKeyboard = Object.keys(unique)
        .map(item => unique[item])
        .map(({ description, camera_key, type }) => {
            if (type === 'camera') {
                return {
                    text: description,
                    callback_data: `tdcam_camera_${camera_key}`,
                };
            }

            return {
                text: description,
                callback_data: `tdcam_subregion_${region}_${camera_key}`,
            }
        });

    // back button: back to all regions
    regionKeyboard.push({
        text: 'Back',
        callback_data: `tdcam_menu`,
    });

    const chunkedMenu = _.chunk(regionKeyboard, 2);

    let body = {
        chat_id: chatId,
        text: "Please choose a TD traffic camera",
        reply_markup: {
            inline_keyboard: chunkedMenu
        },
    };

    // todo: duplicate snippets
    let url;
    if (isUpdateMessage && messageId) {
        url = telegramPaths({
            token: process.env.TELEGRAM_TOKEN
        }).editMessageText;

        if (messageId) {
            body = {
                ...body,
                message_id: messageId,
            };
        }
    } else {
        url = telegramPaths({
            token: process.env.TELEGRAM_TOKEN
        }).sendMessage;
    }

    await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body)
    });
}

function getDescriptionByKey(key) {
    return new Promise(async resolve => {
        const pool = getPool();

        pool.query("SELECT * FROM info.td_traffic_camera WHERE camera_key = ?", [key], async (err, data) => {
            if (err) {
                console.log(err);
            }

            let result = data;
            if (data.length > 0) {
                result = data[0]
            }

            resolve(result);
        });
    });
}

module.exports = {
    regionMenu,
    subregionMenu,
    cameraInRegionMenu,
    getDescriptionByKey,
};

const { getKmbBbi } = require("./kmb-bbi/KmbBbi");
const { getSpecialWeatherTips } = require("./hko/local-forecast/getSpecialWeatherTips");
const { getLocalForecast } = require("./hko/local-forecast/getLocalForecast");
const { weatherStation } = require("./hko/weather-station/weatherStation");
const { respondRadarCommand } = require("./hko/radar-images2/getRadarImages");
const { radaraMenuWithBack } = require("./helpers/menu");
const { respondAnimationCommand } = require("./hko/radar-images2/getRadarImages");
const { radarRangeKeyboardWithBack } = require("./hko/radar-images2/radarKeyboard");
const { sendVideoByPath } = require("./telegram/sendMessage");
const { tdCam } = require("./td/tdCam");
const { mainMenu } = require("./helpers/menu");
const { insertUser, unsubscribeUser } = require("./hko/weather-warning2/userList");
const { updateInlineKeyboardWithCallback } = require("./telegram/keyboard");
const { sendWeatherPhoto } = require("./hko/weather-photo/sendWeatherPhoto");
const { locationKeyboardWithBack } = require("./hko/weather-photo/replyLocationKeyboard");
const { sendMessage } = require("./telegram/sendMessage");
const { checkWarning2 } = require('./hko/weather-warning2/checkWarnings');

async function router(msg, match, isUpdate = true) {
    const chatId = msg.chat.id;

    let messageId;
    if (isUpdate) {
        messageId = msg.message_id;
    }

    if (match && match[1]) {
        if (match[1] === "start" || match[1] === 'main') {
            // prompt subscribe and show main menu
            await updateInlineKeyboardWithCallback({
                chatId, messageId,
                text: `Choose an action:`,
                inlineKeyboard: mainMenu(),
            });
        }
        else if (match[1] === "subscribe") {
            await insertUser({
                chat_id: chatId,
                username: msg.chat.username,
            });

            // send welcoming message
            await sendMessage({
                chat_id: chatId,
                text: "Thank you for subscribing, you will receive HKO weather warning from now on.",
            })

        }
        else if (match[1] === "unsubscribe") {
            await unsubscribeUser({
                chat_id: chatId
            });

            // send message to tell user that he/she has unsubscribed from the service
            await sendMessage({
                chat_id: chatId,
                text: "You have been removed from the HKO weather warning push list.",
            });

        }
        else if (match[1] === "check") {
            // todo: check function
            await checkWarning2({ chatId });

        }
        else if (match[1] === "help") {
            // print help and show main menu
            await updateInlineKeyboardWithCallback({
                chatId, messageId,
                text: `Things you can do:
/start: Main menu
/subscribe: Subscribe to HKO weather warning
/unsubscribe: Unsubscribe yourself from HKO weather warning
/check: Check currently active HKO weather warnings
/radar_<range:64,128,256>: Get radar image
/radara_<range:64,128,256>_<integer(number of previous images in 10, 20)>: Get animated radar
/weatherphoto_<location_code>: Show list of locations, then click to get image
/weatherstation_<type>_<weather_station_code>: Show weather data series graph
/satimage: Satellite image
/tdcam: TD traffic camera images
/tips: Special weather tips
/local: Local weather and forecast
/lightning: Lightning count around HK
/tkwvec: Latest To Kwa Wan Vehicle Examination Center Express photo
/traffic: Latest traffic news
/help: this help menu`,
                inlineKeyboard: mainMenu(),
                // inlinekeyboard, text
            });
        }
        else if (match[1] === "radar") {
            // radar_menu
            if (match[2] === "menu") {
                // radar_64, radar_128, radar_256
                await radarRangeKeyboardWithBack({
                    chatId, messageId,
                });
            }
            else if (match[2] === '') {
                // default show 64km radar image
                await respondRadarCommand(chatId, {
                    range: '64',
                });

                await radarRangeKeyboardWithBack({
                    chatId, messageId,
                });
            }
            else {
                // print radar photos:
                await respondRadarCommand(chatId, {
                    range: match[2].trim(),
                });
            }

        }
        else if (match[1] === "radara") {
            // radara_menu
            if (match[2] === 'menu') {
                await updateInlineKeyboardWithCallback({
                    chatId, messageId,
                    text: 'Please choose radar range',
                    inlineKeyboard: radaraMenuWithBack(),
                    // inlinekeyboard, text
                });
            }
            else if (match[2] === '') {
                // default show 64km 10frames animation
                const video = await respondAnimationCommand(chatId, {
                    range: '64',
                    frames: 10,
                });

                await sendVideoByPath(chatId, video.animation);

                await updateInlineKeyboardWithCallback({
                    chatId, messageId,
                    text: 'Please choose radar range',
                    inlineKeyboard: radaraMenuWithBack(),
                    // inlinekeyboard, text
                });

            }
            // radara_<range>_<frames>
            else {
                const rangeFrameMatch = /([^_]*)_([^_]*)/.exec(match[2]);

                if (rangeFrameMatch.length === 3) {
                    const [_, range, frames] = rangeFrameMatch;

                    const video = await respondAnimationCommand(chatId, {
                        range, frames,
                    });

                    await sendVideoByPath(chatId, video.animation);
                }

            }

        }
        else if (match[1] === 'weatherphoto') {
            // weatherphoto_menu
            if (match[2] === 'menu' || match[2] === '') {
                await updateInlineKeyboardWithCallback({
                    chatId, messageId,
                    text: 'Please choose a location',
                    inlineKeyboard: await locationKeyboardWithBack(),
                });

            } else {
                await sendWeatherPhoto({
                    location_code: match[2],
                    chatId,
                });
            }
            // weatherphoto_<station_key>
        }
        else if (match[1] === "tdcam") {
            await tdCam(match, {
                chatId, messageId,
            });

        }
        else if (match[1] === 'weatherstation') {
            await weatherStation(match, {
                chatId, messageId,
            });
        }
        else if (match[1] === 'local') {
            await getLocalForecast(chatId);
        }
        else if (match[1] === 'tips') {
            await getSpecialWeatherTips(chatId);
        }
        else if (match[1] === 'bbi') {
            await getKmbBbi(match[2], chatId, messageId);
        }
    }

}

module.exports = {
    router,
};


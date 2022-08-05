const { sendMessage, sendSticker } = require("../../telegram/sendMessage");
const { connectMysql } = require('./../../helpers/mysql');
const { getActiveWarning } = require('./../weather-warning2/getWarning');
// const { logCheck } = require('./../weather-warning/sendWarning');
const moment = require('moment-timezone');

// todo: check warning:
//  if thunderstorm warning is in force,
//  print lightning count summary

async function checkWarning2(params) {
    await sendMessage({
        chat_id: params.chatId,
        text: `Checking for currently active HKO weather warnings`,
    });

    const connection = await connectMysql();
    const activeWarnings = await getActiveWarning(connection);

    const numberWarnings = activeWarnings.length;
    if (numberWarnings === 0) {
        await sendMessage({
            chat_id: params.chatId,
            text: `There are no active warnings.`,
        });
    } else if (numberWarnings === 1) {
        await sendMessage({
            chat_id: params.chatId,
            text: `There is 1 active warning.`,
        });
    } else if (numberWarnings > 1) {
        await sendMessage({
            chat_id: params.chatId,
            text: `There are ${numberWarnings} active warnings.`,
        });
    }

    for (let warning of activeWarnings) {
        let warningContent = `${warning.warning_name} (${moment(warning.warning_created_at).tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')})`;

        await sendMessage({
            chat_id: params.chatId,
            text: warningContent,
        });
        
        await sendSticker({
            chat_id: params.chatId,
            sticker_file_id: warning.sticker_file_id,
        });

    }

}

module.exports = {
    checkWarning2,
};

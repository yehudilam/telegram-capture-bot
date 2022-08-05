const { inlineKeyboardWithCallback, updateInlineKeyboardWithCallback } = require("./../../telegram/keyboard");
const _ = require('lodash');

function rangeKeyboard() {
    const ranges = [64, 128, 256];

    // without lodash chunk
    return ranges.map(x => {
        return {
            text: x,
            callback_data: `radar_${x}`,
        };
    });
}

async function radarRangeKeyboard(options) {
    const chatId = options.chatId;

    await inlineKeyboardWithCallback({
        chatId,
        text: 'Please choose radar range',
        inlineKeyboard: [rangeKeyboard()],
    });
}

async function radarRangeKeyboardWithBack(options) {
    const { chatId, messageId } = options;

    await updateInlineKeyboardWithCallback({
        chatId, messageId,
        text: 'Please choose radar range',
        inlineKeyboard: _.chunk([
            ...rangeKeyboard(),
            {
                text: 'Back',
                callback_data: `main`,
            }
        ], 2),
    });
}

module.exports = {
    radarRangeKeyboard,
    radarRangeKeyboardWithBack,
};

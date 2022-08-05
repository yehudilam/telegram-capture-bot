const { getLocationCodes } = require('./getLocationCodes');
const _ = require('lodash');

async function replyLocationKeyboard() {
    const res = await getLocationCodes();

    const codes = res.map(code => {
        return {
            text: code.description,
            switch_inline_query_current_chat: `/photo ${code.location_code}`,
        }
    });

    return _.chunk(codes, 3);
}

async function locationKeyboardCallback() {
    const res = await getLocationCodes();

    const codes = res.map(code => {
        return {
            text: code.description,
            callback_data: `weatherphoto_${code.location_code}`,
        }
    });

    return _.chunk(codes, 3);
}

async function locationKeyboardWithBack() {
    const res = await getLocationCodes();

    const codes = res.map(code => {
        return {
            text: code.description,
            callback_data: `weatherphoto_${code.location_code}`,
        }
    });

    return _.chunk([
        ...codes,
        {
            text: "Back",
            callback_data: `main`,
        },
    ], 3);
}

module.exports = {
    replyLocationKeyboard,
    locationKeyboardCallback,
    locationKeyboardWithBack,

};

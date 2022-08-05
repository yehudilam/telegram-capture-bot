
function telegramPaths(param){
    return {
        sendMessage: `https://api.telegram.org/bot${ param.token }/sendMessage`,
        sendPhoto: `https://api.telegram.org/bot${ param.token }/sendPhoto`,
        editMessageText: `https://api.telegram.org/bot${ param.token }/editMessageText`,

        sendSticker: `https://api.telegram.org/bot${param.token}/sendSticker`,
    };
}

module.exports = {
    telegramPaths
};

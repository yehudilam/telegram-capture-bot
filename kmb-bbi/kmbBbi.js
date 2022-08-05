const fetch = require('node-fetch');
const {updateInlineKeyboardWithCallback} = require("../telegram/keyboard");
const {kmbBbiRequest} = require("./KmbBbiHelpers");
const {telegramPaths} = require("../config/telegramPaths");
const { sendMessage } = require('../telegram/sendMessage');
const _ = require('lodash');
const { boundTypeMap } = require('./kmbBbiConstants');


// todo: use messageId to update message content
async function chooseSecondRoute(matchString, chatId){
    const data = matchString.match(/([^_]+)/g);

    if(data.length > 2){
        const [route1, bound, interchangeType] = data;

        const response = await kmbBbiRequest(route1, bound, interchangeType);

        const routes = response.Records;

        const routesMenu = routes.map(route => {
            return {
                text: route.sec_routeno,
                callback_data: `bbi_both_${route1}_${bound}_${interchangeType}_${route.sec_routeno}`,
            };
        });

        return updateInlineKeyboardWithCallback({
            inlineKeyboard: _.chunk(routesMenu, 4),
            chatId,
            text: 'Choose second route',
        });
    }

    return false;
}

// given route1 bound interchangeType and route2
async function printBbiInformation(matchString, chatId){
    const data = matchString.match(/([^_]+)/g);

    if(data.length > 3){
        const [route1, bound, interchangeType, route2] = data;

        const response = await kmbBbiRequest(route1, bound, interchangeType);

        const dest = response.bus_arr.length > 0 && response.bus_arr[0].dest;

        const record = response.Records.find(route => route.sec_routeno === route2);

        if(!record){
            return;
        }

        const discountBody = `${record.xchange} ${record.discount_max} ${record.detail}`;

        if(interchangeType === '2'){
            return sendMessage({
                chat_id: chatId,
                text: `${route2} > ${route1} (${dest}) ${discountBody}`,
            });
        }else{
            return sendMessage({
                chat_id: chatId,
                text: `${route1} (${dest}) > ${route2} ${discountBody}`,
            });
        }
    }

    return false;
}

// given two routes only
async function printAnyBbiInformation({ route1, route2, chatId }){
    const directionResponse = await Promise.all([
        kmbBbiRequest(route1, 'F'),
        kmbBbiRequest(route1, 'B'),
        kmbBbiRequest(route1, 'F', 2),
        kmbBbiRequest(route1, 'B', 2),
    ]);

    const unionResponse = directionResponse.reduce((acc, cur, index) => {
        let route1Dir = '';

        if(cur.bus_arr && cur.bus_arr.length > 0){
            route1Dir = cur.bus_arr[0].dest;
        }

        return [
            ...acc,
            ...cur.Records.map(record => ({
                ...record,
                route1,
                route1Dir,
                interchangeType: boundTypeMap[index].interchangeType,
            })),
        ];
    }, []);

    const routeMatches = unionResponse.filter(record => record.sec_routeno === route2);

    const discount = routeMatches
        // todo: add route1 and route2 info
        .map(record => {
            const discountBody = `${record.xchange} ${record.discount_max} ${record.detail}`;

            if(record.interchangeType === 2){
                return `${route2} > ${route1} (${record.route1Dir}) ${discountBody}`
            }else{
                return `${route1} (${record.route1Dir}) > ${route2} ${discountBody}`
            }
        })
        .join('\n');

    return sendMessage({
        chat_id: chatId,
        text: discount,
    });
}

// given one route only
async function printRoute2Options(routeName, chatId){
    // list all possible directions
    const directionResponse = await Promise.all([
        kmbBbiRequest(routeName, 'F'),
        kmbBbiRequest(routeName, 'B'),
        kmbBbiRequest(routeName, 'F', 2),
        kmbBbiRequest(routeName, 'B', 2),
    ]);

    const directions = directionResponse.map((response, index) => {
        if(response.bus_arr && response.bus_arr.length > 0){
            return {
                name: response.bus_arr[0] && `第${boundTypeMap[index].interchangeType === 2 ? '二' : '一'}程 ${routeName} 往 ${response.bus_arr[0].dest}`,
                bound: boundTypeMap[index].bound,
                interchangeType: boundTypeMap[index].interchangeType,
            };
        }

        return false;
    })
        .filter(x => x);

    return updateInlineKeyboardWithCallback({
        inlineKeyboard: directions.map(dir => {
            return [
                {
                    text: dir.name,
                    callback_data: `bbi_route1_${routeName}_${dir.bound}_${dir.interchangeType}`
                },
            ];
        }),
        chatId,
        text: 'Choose first route bound and order',
    });
}

// params:
// interchangeType (2)
// routeno
// buscompany=undefined
// bound (F/B)
// jtSorting=sec_routeno ASC

async function getKmbBbi(match, chatId, messageId) {
    // todo: simplify this?
    const args = match;

    if (!args) {
        // /bbi only
        // ask for first route/ both routes

        // todo: save user state!
        return;
    }

    // is update
    if(args.startsWith('route1')){
        // const data = match.replace("_route1", "").match(/([^_]+)/g);
        return chooseSecondRoute(args.replace("route1", ""), chatId);
    }

    // is update
    if(args.startsWith('both')){
        return printBbiInformation(args.replace("both", ""), chatId);
    }

    // match routes:
    const routeNameMatch = args.match(/ *(\w+)/g);

    // two routes
    if (routeNameMatch.length > 1) {
        const route1 = routeNameMatch[0].trim().toUpperCase();
        const route2 = routeNameMatch[1].trim().toUpperCase();

        return printAnyBbiInformation({ route1, route2, chatId});
    }

    // one route only
    if (routeNameMatch.length > 0) {
        const routeName = routeNameMatch[0].trim().toUpperCase();

        return printRoute2Options(routeName, chatId);
    }


}

module.exports = {
    getKmbBbi,
};

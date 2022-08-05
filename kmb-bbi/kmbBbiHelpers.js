const fetch = require('node-fetch');

const KMB_BBI_URL = 'https://www.kmb.hk/ajax/BBI/get_BBI2.php';

function buildSearchParam({
    interchangeType,
    routeno,
    bound,
}) {
    let params = {
        routeno,
        buscompany: 'undefined',
        bound,
        jsSorting: 'sec_routeno ASC',
    };

    // not necessary when interchangeType === 1
    if (interchangeType === '2' || interchangeType === 2) {
        params = {
            ...params,
            interchangeType,
        };
    }

    return Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
}

async function kmbBbiRequest(route, bound, interchangeType) {
    const queryUrl = `${KMB_BBI_URL}?${buildSearchParam({
        routeno: route,
        bound, interchangeType,
    })}`;

    const response = await fetch(queryUrl);

    return response.json();
}

module.exports = {
    // buildSearchParam,
    kmbBbiRequest,
};


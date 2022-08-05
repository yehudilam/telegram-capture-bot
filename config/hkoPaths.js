
const url = {
    warning: {
        rssSummary: `https://rss.weather.gov.hk/rss/WeatherWarningSummaryv2_uc.xml`,
        rssBulletin: `https://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml`,
    },
    radar: {
        radar_64: 'http://www.hko.gov.hk/wxinfo/radars/rad_064_png/2d064nradar_',
        radar_128: 'http://www.hko.gov.hk/wxinfo/radars/rad_128_png/2d128nradar_',
        radar_256: 'http://www.hko.gov.hk/wxinfo/radars/rad_256_png/2d256nradar_',
    },
    weatherPhoto:{
        listOfContents: 'http://www.hko.gov.hk/wxinfo/ts/index_webcam_uc.htm',
        base: 'http://www.hko.gov.hk/wxinfo/aws/hko_mica/',
    }
};

function weatherPhoto(location){
    return `http://www.hko.gov.hk/wxinfo/aws/hko_mica/${ location.toLowerCase() }/latest_${ location.toUpperCase() }.jpg`;
}

module.exports = {
    url,
    weatherPhoto
};

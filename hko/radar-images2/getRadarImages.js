const {createAnimation} = require("./radarAnimation");
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const { url } = require('./../../config/hkoPaths');
const fs = require('fs-extra');
const path = require('path');
const { sendPhotoByPath } = require('./../../telegram/sendMessage');

function getTimestamp(param){
    let step = 6;
    if(param.range){
        switch(param.range){
            case '128':
            case '256':
                step = 12;

                break;
            case '64':
            default:
                step = 6;

                break;
        }
    }

    const now = moment.tz(moment(), 'YYYY-MM-DD HH:mm:ss', 'Asia/Hong_Kong');

    // radar images will not be available immediately, give some buffer time
    now.subtract(step + 1, 'minutes');

    // custom offset:
    if(param.offset){
        now.subtract(param.offset * step, 'minutes');
    }

    let radarTime = Math.floor(now.valueOf() / (step * 60 * 1000));
    radarTime = moment.tz(radarTime * (step * 60 * 1000), 'Asia/Hong_Kong').format('YYYYMMDDHHmm');

    return radarTime;
}

function checkIfImageExists(path){
    return new Promise((resolve) => {
        fs.access(path, fs.constants.W_OK, (err) => {
            if(err){
                resolve(false);
            }

            resolve(true);
        });
    })
}

function checkDir(path){
    return new Promise(async(resolve) => {
        fs.ensureDir(path, err => {
            if(err){
                console.log(err);
            }

            resolve();
        })
    })
}

function getWriteRadarImage(param){
    return new Promise(async(resolve) => {
        // further: check if the image has been cached

        const timestamp = getTimestamp(param);
        const imagePath = `${ param.imageFolderPath }/${ timestamp }.jpg`;
        const imageExists = await checkIfImageExists(imagePath);

        if(imageExists){
            return resolve(imagePath);
        }

        const response = await fetch(`${ url.radar[`radar_${param.range}`] }${ timestamp }.jpg`);
        const dest = fs.createWriteStream(imagePath);

        response.body.pipe(dest);

        dest.on('finish', () => {
            console.log('stream image finish event', imagePath);
            resolve(imagePath);
        });
    })
}


// params: {offset: number, range: string in '64', '128', '256'}
function getAllRadarImagePaths(params){
    return new Promise(async(resolve) => {
        const range = params[0].range;
        const imageFolderPath = path.resolve(__dirname,
            './../../media/source/',
            `${ range }/${ moment().format('YYYYMMDD') }/`);

        // create dir structure if not exist
        await checkDir(imageFolderPath);

        params = params.map(param => {
            return {
                ...param,
                imageFolderPath,
            };
        });

        const results = await Promise.all(params.map(async(param) => {
            return getWriteRadarImage(param);
        }));

        const noEmptyImage = results.filter(path => {
            const stats = fs.statSync(path);

            return stats["size"] > 10000;
        });

        resolve({
            imagePaths: noEmptyImage,
            imageFolderPath
        });
    })
}

function respondRadarCommand(chatId, param){
    return new Promise(async(resolve) => {
        const params = [ param ];

        const paths = await getAllRadarImagePaths(params);

        const imagePath = paths.imagePaths ? paths.imagePaths[0] : [];

        await sendPhotoByPath({
            chatId,
            filename: param.range,
            fullPath: imagePath,
        });

        resolve();
    });
}

function respondAnimationCommand(chatId, param){
    return new Promise(async resolve => {
        const { range, frames } = param;

        const imageRetriever = [];
        let imageCount = 0;
        while(imageCount < frames){
            imageRetriever.push({
                offset: imageCount,
                range
            });

            imageCount += 1;
        }

        const images = await getAllRadarImagePaths(imageRetriever);
        const animation = await createAnimation(images);

        resolve({
            action: 'animation',
            animation
        });
    });
}

module.exports = {
    respondRadarCommand,
    respondAnimationCommand,
    getWriteRadarImage,
    getAllRadarImagePaths,
};

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
ffmpeg.setFfprobePath(ffprobePath);

const moment = require('moment');
const uniqid = require('uniqid');
const videoshow = require('videoshow');
const sharp = require('sharp');

async function imageCheck(images){
    // check image:
    const promises = await Promise.all(images
        .map(image => {
            return sharp(image, {
                failOnError: true,
            })
                .metadata()
                .catch((e) => {
                    console.log('sharp load error: ', e);

                    // todo: delete photo on error
                    fs.unlinkSync(image);
                });


        }));

    return;
}

function createAnimation(images) {
    return new Promise(async (resolve) => {
        const videoOptions = {
            fps: 25,
            loop: 0.1, // seconds
            transition: false,
            videoCodec: 'mpeg4',
            size: '640x?',
            format: 'mp4',
        };

        const videoPath = path.resolve(__dirname, './../../media/production/animation',
            `${uniqid()}-${moment().format('YYYYMMDDHHmmss')}.mp4`
        );

        await imageCheck(images.imagePaths);

        videoshow(images.imagePaths.reverse(), videoOptions)
            .save(videoPath)
            .on('end', function (output) {
                resolve(output);
            })
            .on('error', function (err) {
                console.log('videoshow error', error);
                resolve();
            })
    })
}

module.exports = {
    createAnimation
};

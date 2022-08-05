const { getPool } = require('./../../helpers/mysql');

function getLocationCodes(){
    return new Promise(async(resolve) => {
        const pool = getPool();

        pool.query('SELECT * FROM weather_photo_location', async (err, data) => {
            if(err){
                console.log(err);
            }

            // trim description: /(面)*天氣照片
            data = data.map(loc => {
                return {
                    ...loc,
                    description: loc.description.replace(/面*天氣照片/g, '')
                }
            });

            resolve(data);
        })
    })
}

function getLocationDescription(location_code){
    return new Promise(async(resolve) => {
        const pool = getPool()

        pool.query(`SELECT description FROM weather_photo_location
        WHERE location_code = ?`, [
            location_code
        ], async (err, data) => {
            if(err){
                console.log(err);
            }

            if(data && data.length > 0){
                resolve(data[0].description);
            }

            resolve();
        })
    });
}

module.exports = {
    getLocationCodes,
    getLocationDescription
};

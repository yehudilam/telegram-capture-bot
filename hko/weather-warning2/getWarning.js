const { getPool } = require('./../../helpers/mysql');

function getActiveWarning(){
    return new Promise(async(resolve) => {
        const pool = getPool();
        
        pool.query(`SELECT hw.warning_text, hw.warning_created_at, w.warning_name,
        w.warning_img, w.sticker_file_id, w.id
        FROM hko_warning as hw
        LEFT JOIN warnings as w ON hw.warning=w.id
        WHERE warning_ended_at IS NULL`, function(err, data){
            if(err){
                console.log(err);
            }

            resolve(data);
        });
    })
}

module.exports = {
    getActiveWarning
}

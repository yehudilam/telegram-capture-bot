const { getPool } = require('./../../helpers/mysql');

function insertUserQuery(user) {
    return new Promise(async (resolve) => {
        const pool = getPool();

        // when the user has already subscribed / user record found, change its status to active: subscribe to warnings
        pool.query(`INSERT INTO chats (chat_id, username, status) VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE status='active'`, [
            user.chat_id,
            user.username,
            'active'
        ], function (err) {
            if (err) {
                console.log(err);
            }

            resolve();
        });
    })
}

function unsubscribeUserQuery(user) {
    return new Promise(async (resolve) => {
        const pool = getPool();

        pool.query(`UPDATE chats SET status='inactive' WHERE chat_id=?`, [
            user.chat_id,
        ], function (err) {
            if (err) {
                console.log(err);
            }

            resolve();
        });
    })
}


async function insertUser(user) {
    await insertUserQuery(user);
}

async function unsubscribeUser(user) {
    await unsubscribeUserQuery(user);
}

module.exports = {
    insertUser,
    unsubscribeUser,
};
const mysql = require('mysql');
require('dotenv').config();

function connectMysql(db) {
    const dbConnection = {
        ...{
            host: process.env.DB_HOST,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_SCHEMA,
        },
        ...db,
    };

    return new Promise(((resolve) => {
        let connection = mysql.createConnection({
            host: dbConnection.host,
            user: dbConnection.username,
            password: dbConnection.password,
            database: dbConnection.database
        });

        connection.connect((err) => {
            if (err) {
                console.log(err);
            }

            resolve(connection);
        });
    }));
}

function closeConnection(connection){
    return new Promise(async(resolve) => {
        connection.end(function(err){
            if(err){
                console.log(err);
            }

            resolve();

        });
    });
}

function connectionPool() {
    return mysql.createPool({
        connectionLimit: 10,
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA,
    });
}

let pool;

function getPool(){
    if(!pool){
        pool = connectionPool();
    }

    return pool;
}

function endPool(){
    return new Promise(resolve => {
        pool.end(function (err) {
            // all connections in the pool have ended
            pool = null;

            resolve();
        });
    });
}

module.exports = {
    connectMysql,
    closeConnection,
    getPool,
}

let mysql = require('mysql');
let util = require('util');
let environmentVar = require('../../environment');
let db =  mysql.createPool({
    host: environmentVar.APP_DB_URL,//'schedulingframeworkdb.cywzxhhwghgs.us-east-2.rds.amazonaws.com',
    port: environmentVar.APP_DB_PORT,//'3306',
    user: environmentVar.APP_DB_USERNAME,
    password: environmentVar.APP_DB_PASSWORD,
    database: 'scheduling_framework',
    // host:'127.0.0.1',
    // port:3306,
    // user:'root',
    // password:'TorresF9',
    // database:'scheduling_framework',
    connectionLimit: 100,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
});
db.on('error', function(err) {
    console.log("[mysql error]",err);
});
db.query = util.promisify(db.query);
module.exports = db;
const mysql = require('mysql');
const databaseInfo = require('../../database.json');

const connection = mysql.createConnection({
  host : databaseInfo.host,
  user : databaseInfo.user,
  password : databaseInfo.password,
  port: databaseInfo.port,
  database : databaseInfo.database,
});

module.exports = connection;
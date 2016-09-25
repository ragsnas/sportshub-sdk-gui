var mysql = require('mysql');
var sportshubSettings = require('./sportshubSettings.js');

console.log('Connecting to MySQL Server (' + sportshubSettings.mysql.host + ':'+sportshubSettings.mysql.port+')');
var mysqlConnection = mysql.createConnection({
  host: sportshubSettings.mysql.host,
  user: sportshubSettings.mysql.user,
  port: sportshubSettings.mysql.port,
  password: sportshubSettings.mysql.password,
  database: sportshubSettings.mysql.database
});
mysqlConnection.connect();

module.exports = mysqlConnection;
var mysql = require("mysql");
var credentials = require("./credentials");

var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: "vocalearn",
    password: credentials.password,
    database: 'vocalearn',
    charset: 'utf8'
});

connection.connect();

module.exports = connection;
var express = require("express");
var app = express();
var cors = require('cors');
const https = require('https');
const fs = require('fs');
path = require('path');
websocket = require("./websocket");

const doc_router = require("./doc_router");
const api_router = require("./api_router");

var corsOptions = {
    origin: 'http://placeblock.undo.it:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.use("/doc", doc_router);
app.use("/api", api_router);
app.use("/", express.static(path.join(__dirname, '../webapp/build')))

var privateKey = fs.readFileSync( '/etc/letsencrypt/live/placeblock.undo.it/privkey.pem' );
var certificate = fs.readFileSync( '/etc/letsencrypt/live/placeblock.undo.it/cert.pem' );
const server = https.createServer({
    key: privateKey,
    cert: certificate
}, app);
websocket.connect(server);


server.listen(8000);
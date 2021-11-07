var {WebSocketServer} = require("ws");
const authentication_model = require("./models/authentication_model");
const crypto = require('crypto');

//USERID -> WS
const connectedClients = {};

var wss = null;

function connect(server) {
    server.on("upgrade", function upgrade(request, socket, head) {
        if(request.headers["upgrade"] !== "websocket") {
            socket.end("HTTP/1.1 400 Bad Request");
            return;
        }
        const cookies = parseCookies(request);
        console.log(request.headers);
        if("token" in cookies) {
            authentication_model.userbytoken(cookies["token"]).then(() => {
                const acceptKey = request.headers['sec-websocket-key'];
                const hash = generateAcceptValue(acceptKey);
                const responseHeaders = [ 'HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: websocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${hash}` ];
                const protocol = request.headers['sec-websocket-protocol'];
                const protocols = !protocol ? [] : protocol.split(',').map(s => s.trim());
                if (protocols.includes('json')) {
                    responseHeaders.push(`Sec-WebSocket-Protocol: json`);
                }
                socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');
            }).catch((error) => {
                console.log(error);
                socket.end("HTTP/1.1 400 Bad Request");
            })
        }
    });

    wss = new WebSocketServer({server});

    wss.on("connection", function connection(ws) {
        ws.isAlive = true;
        ws.apitoken = undefined;
        ws.userid = undefined;
    
        ws.on('pong', heartbeat);
    
        ws.on("message", (message) => {
            var json = JSON.parse(message);
            if(!validateStandart(json)) return;
            
            switch (json["action"]) {
                case "token":
                    authentication_model.userbytoken(json["data"]).then((userid) => {
                        ws.apitoken = json["data"];
                        ws.userid = userid;
                        console.log("VERIFIED USER: " + userid);
                        connectedClients[userid] = ws;
                        console.log(Object.keys(connectedClients));
                    }).catch((err) => {
                        console.log(err);
                    })
            }
        });
    
        ws.on("close", () => {
            console.log("DISCONNECTED USER: " + ws.userid);
            delete connectedClients[ws.userid];
            console.log(Object.keys(connectedClients));
        });
    })

    wss.on('close', function close() {
        clearInterval(interval);
        connectedClients = {};
    });
}
exports.connect = connect;

function friendRemoved(userid, oldfriend) {
    if(!(userid in connectedClients)) return;
    const ws = connectedClients[userid];
    ws.send(JSON.stringify({"action":"friendRemoved","data":{"oldfriend":oldfriend}}));
}
exports.friendRemoved = friendRemoved;

function friendRequest(userid, friend) {
    if(!(userid in connectedClients)) return;
    const ws = connectedClients[userid];
    ws.send(JSON.stringify({"action":"friendRequest","data":{"friend":friend}}));
}
exports.friendRequest = friendRequest;

function friendRequestRemoved(userid, friend) {
    if(!(userid in connectedClients)) return;
    const ws = connectedClients[userid];
    ws.send(JSON.stringify({"action":"friendRequestRemoved","data":{"friend":friend}}));
}
exports.friendRequestRemoved = friendRequestRemoved;

function friendRequestAccepted(userid, friend) {
    if(!(userid in connectedClients)) return;
    const ws = connectedClients[userid];
    ws.send(JSON.stringify({"action":"friendRequestAccepted","data":{"friend":friend}}));
}
exports.friendRequestAccepted = friendRequestAccepted;

function friendRequestDeclined(userid, friend) {
    if(!(userid in connectedClients)) return;
    const ws = connectedClients[userid];
    ws.send(JSON.stringify({"action":"friendRequestDeclined","data":{"friend":friend}}));
}
exports.friendRequestDeclined = friendRequestDeclined;

function sendMessage(userid, friend, message) {
    if(!(userid in connectedClients)) return;
    const ws = connectedClients[userid];
    ws.send(JSON.stringify({"action":"message","data":{"friend":friend,"message":message}}));
}
exports.sendMessage = sendMessage;

function messageDeleted(userid, messageid) {
    if(!(userid in connectedClients)) return;
    const ws = connectedClients[userid];
    ws.send(JSON.stringify({"action":"messageDeleted","data":{"id":messageid}}));
}
exports.messageDeleted = messageDeleted;

function messageEdited(userid, messageid, newmessage) {
    if(!(userid in connectedClients)) return;
    const ws = connectedClients[userid];
    ws.send(JSON.stringify({"action":"messageEdited","data":{"id":messageid,"newmessage":newmessage}}));
}
exports.messageEdited = messageEdited;

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            delete connectedClients[ws.userid];
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(noop);
    });
}, 60000);

function validateStandart(json) {
    return "action" in json;
}

function heartbeat() {
    this.isAlive = true;
}

function noop() {

}



function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;
    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

function generateAcceptValue (acceptKey) {
    return crypto
    .createHash('sha1')
    .update(acceptKey + '258EAFA5-E914–47DA-95CA-C5AB0DC85B11', 'binary')
    .digest('base64');
}
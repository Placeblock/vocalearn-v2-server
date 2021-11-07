const db = require("./database.js");
const buildError = require("../builderror");


function getFriendRequests(userid) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT friend_invitations.inviter, voc_users.name FROM friend_invitations INNER JOIN voc_users ON friend_invitations.inviter=voc_users.id WHERE invited = ?";
        db.query(sql, [userid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4100, "Database Error: " + error));
                return;
            }
            var result = {};
            for(row of rows) {
                result[row["inviter"]] = row["name"];
            }
            resolve(result);
        });
    });
}
exports.getFriendRequests = getFriendRequests;

function getOwnFriendRequests(userid) {
    return new Promise(async function(resolve, reject) {
        var sql = "SELECT friend_invitations.invited, voc_users.name FROM friend_invitations INNER JOIN voc_users ON friend_invitations.invited=voc_users.id WHERE inviter = ?";
        db.query(sql, [userid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4101, "Database Error: " + error));
                return;
            }
            var result = {};
            for(row of rows) {
                result[row["invited"]] = row["name"];
            }
            resolve(result);
        });
    });
}
exports.getOwnFriendRequests = getOwnFriendRequests;

function createFriendRequest(userid, friendid) {
    return new Promise(async function(resolve, reject) {
        var sql = "INSERT INTO friend_invitations (inviter, invited) VALUES (?,?)";
        db.query(sql, [userid, friendid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4102, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.createFriendRequest = createFriendRequest;

function deleteFriendRequest(userid, friendid) {
    return new Promise(async function(resolve, reject) {
        var sql = "DELETE FROM friend_invitations WHERE inviter = ? AND invited = ?";
        db.query(sql, [userid, friendid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4103, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.deleteFriendRequest = deleteFriendRequest;

function getFriends(userid) {
    return new Promise(async function(resolve, reject) {
        var sql = "SELECT a.friend, voc_users.name FROM (select user,friend from friends union select friend,user from friends) AS a INNER JOIN voc_users ON a.friend=voc_users.id WHERE a.user=?";
        db.query(sql, [userid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4104, "Database Error: " + error));
                return;
            }
            var result = {};
            for(row of rows) {
                result[row["friend"]] = row["name"];
            }
            resolve(result);
        });
    });
}
exports.getFriends = getFriends;

function addFriend(userid, friendid) {
    return new Promise(async function(resolve, reject) {
        var sql = "INSERT INTO friends (user, friend) VALUES (?,?)";
        db.query(sql, [userid, friendid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4105, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.addFriend = addFriend;

function removeFriend(userid, friendid) {
    return new Promise(async function(resolve, reject) {
        var sql = "DELETE FROM friends WHERE user = ? AND friendid = ?";
        db.query(sql, [userid, friendid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4106, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.removeFriend = removeFriend;

function sendMessage(userid, friendid, message) {
    return new Promise(async function(resolve, reject) {
        var sql = "INSERT INTO friend_messages (user, friend, message) VALUES (?,?,?)";
        db.query(sql, [userid, friendid, message], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 4107, "Database Error: " + error));
                return;
            }
            var messageid = result.insertId;
            resolve(messageid);
        });
    });
}
exports.sendMessage = sendMessage;

function deleteMessage(messageid) {
    return new Promise(async function(resolve, reject) {
        var sql = "DELETE FROM friend_messages WHERE id = ?";
        db.query(sql, [messageid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4108, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.deleteMessage = deleteMessage;

function editMessage(messageid, newmessage) {
    return new Promise(async function(resolve, reject) {
        var sql = "UPDATE friend_messages SET message = ? WHERE id = ?";
        db.query(sql, [newmessage, messageid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4109, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.editMessage = editMessage;

function messageOwner(messageid) {
    return new Promise(async function(resolve, reject) {
        var sql = "SELECT user FROM friend_messages WHERE id = ?";
        db.query(sql, [messageid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4110, "Database Error: " + error));
                return;
            }
            if(rows.length == 0) {
                reject(buildError(400, 4111, "There is no message with that id"));
                return;
            }
            resolve(rows[0]["user"]);
        });
    });
}
exports.messageOwner = messageOwner;

function getChatRecord(userid, friendid) {
    return new Promise(async function(resolve, reject) {
        var sql = "SELECT * FROM friend_messages WHERE (user = ? AND friend = ?) OR (user = ? AND friend = ?) ORDER BY time ASC";
        db.query(sql, [userid, friendid, friendid, userid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4112, "Database Error: " + error));
                return;
            }
            resolve(rows);
        });
    });
}
exports.getChatRecord = getChatRecord;
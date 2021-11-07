var express = require("express");
var friend_router = express.Router();
var friend_model = require("../models/friend_model");
const buildError = require("../builderror");
var websocket = require("../websocket");

friend_router.get("/get/", function(req, res) {
    friend_model.getFriends(req.userid).then((friends) => {
        res.json({"friends":friends});
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.delete("/remove/", function(req, res) {
    var friendid = req.body.friendid;    
    if(friendid === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an friendid parameter!")});
        return;
    }
    friend_model.removeFriend(req.userid, friendid).then(() => {
        websocket.friendRemoved(friendid, req.userid);
        res.end();
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.get("/getRequests/", function(req, res) {
    friend_model.getFriendRequests(req.userid).then((requests) => {
        res.json({"requests":requests});
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.get("/getOwnRequests/", function(req, res) {
    friend_model.getOwnFriendRequests(req.userid).then((requests) => {
        res.json({"requests":requests});
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});


friend_router.post("/createRequest/", function(req, res) {
    var friendid = req.body.friendid;    
    if(friendid === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an friendid parameter!")});
        return;
    }
    friend_model.createFriendRequest(req.userid, friendid).then(() => {
        websocket.friendRequest(friendid, req.userid);
        res.end();
    }).catch((err) => {
        console.log(err);
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.delete("/removeRequest/", function(req, res) {
    var friendid = req.body.friendid;    
    if(friendid === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an friendid parameter!")});
        return;
    }
    friend_model.deleteFriendRequest(req.userid, friendid).then(() => {
        websocket.friendRequestRemoved(friendid, req.userid);
        res.end();
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.post("/acceptRequest/", function(req, res) {
    var friendid = req.body.friendid;  
    if(friendid === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an friendid parameter!")});
        return;
    }
    friend_model.deleteFriendRequest(friendid, req.userid).then(() => { 
        friend_model.addFriend(friendid, req.userid).then(() => {
            websocket.friendRequestAccepted(friendid, req.userid);
            res.end();
        }).catch((err) => {
            res.status(err["httpcode"]).send({"error":err});
        });
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.post("/declineRequest/", function(req, res) {
    var friendid = req.body.friendid;  
    if(friendid === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an friendid parameter!")});
        return;
    }
    friend_model.deleteFriendRequest(friendid, req.userid).then(() => { 
        websocket.friendRequestDeclined(friendid, req.userid);
        res.end();
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.post("/sendMessage/", function(req, res) {
    var friendid = req.body.friendid;    
    var message = req.body.message;   
    if(friendid === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an friendid parameter!")});
        return;
    }
    if(message === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an message parameter!")});
        return;
    }
    friend_model.sendMessage(req.userid, friendid, message).then((messageid) => {
        websocket.sendMessage(friendid, req.userid, message);
        res.json({"id":messageid});
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.delete("/deleteMessage/", function(req, res) {
    var id = req.body.id;    
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    friend_model.messageOwner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 2012, "Unauthorized! This is not your message!")});
        }else {
            friend_model.deleteMessage(id).then(() => {
                websocket.messageDeleted(friendid, id);
                res.end();
            }).catch((err) => {
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.put("/editMessage/", function(req, res) {
    var id = req.body.id;     
    var message = req.body.message;   
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    if(message === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an message parameter!")});
        return;
    }
    friend_model.messageOwner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 2012, "Unauthorized! This is not your message!")});
        }else {
            friend_model.editMessage(id, message).then(() => {
                websocket.messageDeleted(friendid, id, message);
                res.end();
            }).catch((err) => {
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

friend_router.get("/chatRecord/", function(req, res) {
    var friendid = req.body.friendid;
    if(friendid === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an friendid parameter!")});
        return;
    }
    friend_model.getChatRecord(req.userid, friendid).then((record) => {
        res.json({"record":record});
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    });
});


module.exports = friend_router;

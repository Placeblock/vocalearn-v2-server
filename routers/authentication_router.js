var express = require("express");
var authentication_router = express.Router();
var authentication_model = require("../models/authentication_model");
var buildError = require("../builderror");

authentication_router.get("*", function(req, res, next) {
    var token = req.query.token;
    checkToken(token, req, res, next);
});

authentication_router.post("*", function(req, res, next) {
    var token = req.body.token;
    checkToken(token, req, res, next);
});

authentication_router.delete("*", function(req, res, next) {
    var token = req.body.token;
    checkToken(token, req, res, next);
});

authentication_router.put("*", function(req, res, next) {
    var token = req.body.token;
    checkToken(token, req, res, next);
});

function checkToken(token, req, res, next) {
    if(token === undefined) {
        res.status(401).send({"error":buildError(401, 1002, "Unauthorized! Please add a token!")});
        return;
    }
    authentication_model.userbytoken(token)
    .then(function(user) {
        req.userid = user;
        next();
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
}

module.exports = authentication_router;
var express = require("express");
var authentication_model = require("../models/authentication_model");
var user_router = express.Router();
const buildError = require("../builderror");

user_router.post("/setdarkmode/", function(req, res) {
    var darkmode = req.body.darkmode;
    if(darkmode === undefined) {
        res.status(400).send({"error":buildError(400, 5000, "Missing Parameters! You should add a darkmode parameter!")});
        return;
    }
    authentication_model.setdarkmode(req.userid, darkmode)
    .then(function() {
        res.end();
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});
user_router.get("/getdarkmode/", function(req, res) {
    authentication_model.getdarkmode(req.userid)
    .then(function(darkmode) {
        res.json({"darkmode":darkmode});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});
user_router.get("/metadata/", function(req, res) {
    var userid = req.body.userid;
    if(userid === undefined) {
        res.status(400).send({"error":buildError(400, 5000, "Missing Parameters! You should add a userid parameter!")});
        return;
    }
    authentication_model.namebyuser(userid)
    .then(function(name) {
        res.json({"name":name});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});
user_router.get("/search/", function(req,res) {
    var regex = req.query.regex;
    if(regex === undefined) {
        res.status(400).send({"error":buildError(400, 2005, "Missing Parameters! You should add an regex parameter!")});
        return;
    }
    authentication_model.searchuser(regex)
    .then(function(result) {
        res.json({"users":result});
    }).catch(function(err) {
        console.log(err);
        res.status(err["httpcode"]).send({"error":err});
    });
});

module.exports = user_router;
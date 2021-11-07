var express = require("express");
var statistics_model = require("../models/statistics_model");
var statistics_router = express.Router();
const buildError = require("../builderror");

statistics_router.post("/add/", function(req, res) {
    var vocable = req.body.vocable;
    var known = req.body.known;
    var direction = req.body.direction;
    if(vocable === undefined) {
        res.status(400).send({"error":buildError(400, 5000, "Missing Parameters! You should add a vocable parameter!")});
        return;
    }
    if(known === undefined) {
        res.status(400).send({"error":buildError(400, 5001, "Missing Parameters! You should add a known parameter!")});
        return;
    }
    if(direction === undefined) {
        res.status(400).send({"error":buildError(400, 5002, "Missing Parameters! You should add a direction parameter!")});
        return;
    }
    statistics_model.add(req.userid, vocable, known, direction)
    .then(function() {
        res.end();
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

statistics_router.get("/vocable/", function(req, res) {
    var vocable = req.query.vocable;
    if(vocable === undefined) {
        res.status(400).send({"error":buildError(400, 5003, "Missing Parameters! You should add a vocable parameter!")});
        return;
    }
    statistics_model.vocable(req.userid, vocable)
    .then(function(statistics) {
        res.json({"statistics":statistics});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

statistics_router.get("/lesson/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 5003, "Missing Parameters! You should add a id parameter!")});
        return;
    }
    statistics_model.lesson(req.userid, id)
    .then(function(statistics) {
        res.json({"statistics":statistics});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

module.exports = statistics_router;

statistics_router.get("/selection/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 5003, "Missing Parameters! You should add a id parameter!")});
        return;
    }
    statistics_model.selection(req.userid, id)
    .then(function(statistics) {
        res.json({"statistics":statistics});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

module.exports = statistics_router;
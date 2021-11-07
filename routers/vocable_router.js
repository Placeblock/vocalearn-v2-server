var express = require("express");
var vocable_router = express.Router();
var vocable_model = require("../models/vocable_model");
var lesson_model = require("../models/lesson_model");
const buildError = require("../builderror");

vocable_router.post("/create/", function(req, res) {
    var lesson = req.body.lesson;
    var n_text = req.body.n_text;
    var f_text = req.body.f_text;
    var hint = req.body.hint;
    if(lesson === undefined) {
        res.status(400).send({"error":buildError(400, 4000, "Missing Parameters! You should add an lesson parameter!")});
        return;
    }
    if(n_text === undefined) {
        res.status(400).send({"error":buildError(400, 4001, "Missing Parameters! You should add an n_text parameter!")});
        return;
    }
    if(f_text === undefined) {
        res.status(400).send({"error":buildError(400, 4002, "Missing Parameters! You should add an f_text parameter!")});
        return;
    }
    if(hint === undefined) {
        res.status(400).send({"error":buildError(400, 4003, "Missing Parameters! You should add an hint parameter!")});
        return;
    }
    lesson_model.owner(lesson)
    .then(function(owner) {
        if(owner != req.userid) {
            res.status(401).send({"error":buildError(401, 4004, "Unauthorized! This is not your lesson!")});
        }else {
            vocable_model.create(lesson, n_text, f_text, hint)
            .then(function(id) {
                res.json({"id":id});
            }).catch(function(err) {
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

vocable_router.delete("/delete/", function(req, res) {
    var id = req.body.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 4005, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    vocable_model.owner(id)
    .then(function(owner) {
        if(owner != req.userid) {
            res.status(401).send({"error":buildError(401, 4006, "Unauthorized! This is not your lesson!")});
        }else {
            vocable_model.delete(id)
            .then(function() {
                res.end();
            }).catch(function(err) {
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

vocable_router.put("/edit/", function(req, res) {
    var id = req.body.id;
    var lesson = req.body.lesson;
    var n_text = req.body.n_text;
    var f_text = req.body.f_text;
    var hint = req.body.hint;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 4007, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    if(lesson === undefined) {
        res.status(400).send({"error":buildError(400, 4008, "Missing Parameters! You should add an lesson parameter!")});
        return;
    }
    if(n_text === undefined) {
        res.status(400).send({"error":buildError(400, 4009, "Missing Parameters! You should add an n_text parameter!")});
        return;
    }
    if(f_text === undefined) {
        res.status(400).send({"error":buildError(400, 4010, "Missing Parameters! You should add an f_text parameter!")});
        return;
    }
    if(hint === undefined) {
        res.status(400).send({"error":buildError(400, 4011, "Missing Parameters! You should add an hint parameter!")});
        return;
    }
    vocable_model.owner(id)
    .then(function(owner) {
        if(owner != req.userid) {
            res.status(401).send({"error":buildError(401, 4012, "Unauthorized! This is not your lesson!")});
        }else {
            vocable_model.edit(id, lesson, n_text, f_text, hint)
            .then(function() {
                res.end();
            }).catch(function(err) {
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

vocable_router.get("/search/", function(req, res) {
    var regex = req.query.regex;
    var n_text_b = req.query.n_text_b;
    var f_text_b = req.query.f_text_b;
    var hint_b = req.query.hint_b;
    if(regex === undefined) {
        res.status(400).send({"error":buildError(400, 4013, "Missing Parameters! You should add an regex parameter!")});
        return;
    }
    if(n_text_b === undefined) {
        res.status(400).send({"error":buildError(400, 4014, "Missing Parameters! You should add an n_text_b parameter!")});
        return;
    }
    if(f_text_b === undefined) {
        res.status(400).send({"error":buildError(400, 4015, "Missing Parameters! You should add an f_text_b parameter!")});
        return;
    }
    if(hint_b === undefined) {
        res.status(400).send({"error":buildError(400, 4016, "Missing Parameters! You should add an hint_b parameter!")});
        return;
    }
    if (n_text_b !== "false" && n_text_b !== "true") {
        res.status(400).send({"error":buildError(400, 4017, "n_text_b should be boolean")});
        return;
    }
    if (f_text_b !== "false" && f_text_b !== "true") {
        res.status(400).send({"error":buildError(400, 4018, "f_text_b should be boolean")});
        return;
    }
    if (hint_b !== "false" && hint_b !== "true") {
        res.status(400).send({"error":buildError(400, 4019, "hint_b should be boolean")});
        return;
    }
    vocable_model.search(regex, n_text_b, f_text_b, hint_b)
    .then(function(result) {
        res.json({"vocables":result});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

module.exports = vocable_router;
var express = require("express");
var selection_model = require("../models/selection_model");
var selection_router = express.Router();
const buildError = require("../builderror");

selection_router.post("/create/", function(req, res) {
    var name = req.body.name;
    if(name === undefined) {
        res.status(400).send({"error":buildError(400, 3000, "Missing Parameters! You should add an name parameter!")});
        return;
    }
    selection_model.create(req.userid, name)
    .then(function(id) {
        res.json({"id":id});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

selection_router.delete("/delete/", function(req, res) {
    var id = req.body.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 3001, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    selection_model.owner(id)
    .then(function(user) {
        if(user !== req.userid) {
            console.log("user"+user);
            console.log("userid" + req.userid);
            res.status(401).send({"error":buildError(401, 3002, "Unauthorized! This is not your Selection!")});
        }else {
            selection_model.delete(id)
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

selection_router.post("/addlesson/", function(req, res) {
    var id = req.body.id;
    var lesson = req.body.lesson;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 3003, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    if(lesson === undefined) {
        res.status(400).send({"error":buildError(400, 3004, "Missing Parameters! You should add an lesson parameter!")});
        return;
    }
    selection_model.owner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 3005, "Unauthorized! This is not your Selection!")});
        }else {
            selection_model.addlesson(id, lesson)
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

selection_router.delete("/removelesson/", function(req, res) {
    var id = req.body.id;
    var lesson = req.body.lesson;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 3006, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    if(lesson === undefined) {
        res.status(400).send({"error":buildError(400, 3007, "Missing Parameters! You should add an lesson parameter!")});
        return;
    }
    selection_model.owner(id)
    .then(function(user) {
        if(user !== req.userid) {
            res.status(401).send({"error":buildError(401, 3008, "Unauthorized! This is not your Selection!")});
        }else {
            selection_model.removelesson(id, lesson)
            .then(function() {
                res.end();
            }).catch(function(err) {
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
        error = true;
    });
});

selection_router.get("/metadata/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 3009, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    selection_model.owner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 3010, "Unauthorized! This is not your Selection!")});
        }else {
            selection_model.metadata(id)
            .then(function(metadata) {
                res.json({"metadata":metadata});
            }).catch(function(err) {
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});


selection_router.get("/content/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 3011, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    selection_model.owner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 3012, "Unauthorized! This is not your Selection!")});
        }else {
            selection_model.content(id)
            .then(function(content) {
                res.json({"content":content});
            }).catch(function(err) {
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

selection_router.get("/vocables/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 3013, "Missing Parameters! You should add an id parameter!")});
        return;
    }    
    selection_model.owner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 3012, "Unauthorized! This is not your Selection!")});
        }else {
            selection_model.vocables(id)
            .then(function(result) {
                res.json({"vocables":result});
            }).catch(function(err) {
                console.log(err);
                res.status(err["httpcode"]).send({"error":err});
            });
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });

});

selection_router.get("/contentmetadata/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 3013, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    selection_model.contentmetadata(id)
    .then(function(result) {
        res.json({"content":result});
    }).catch(function(err) {
        console.log(err);
        res.status(err["httpcode"]).send({"error":err});
    });
});

selection_router.get("/usermetadata/", function(req, res) {
    selection_model.usermetadata(req.userid)
    .then(function(result) {
        res.json({"selections":result});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

selection_router.get("/user/", function(req, res) {
    selection_model.user(req.userid)
    .then(function(result) {
        res.json({"selections":result});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});


module.exports = selection_router;
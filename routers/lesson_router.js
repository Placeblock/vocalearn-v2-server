var express = require("express");
var lessons_router = express.Router();
var lessons_model = require("../models/lesson_model");
const buildError = require("../builderror");


lessons_router.post("/create/", function(req, res) {
    var name = req.body.name;
    var private = req.body.private;
    if(private === undefined || (private !== 0 && private !== 1)) {
        private = false;
    }
    if(name === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an name parameter!")});
        return;
    }
    lessons_model.create(name, private, req.userid)
    .then(function(id) {
        res.json({"id":id});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

lessons_router.delete("/delete/", function(req, res) {
    var id = req.body.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2002, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    lessons_model.owner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 2012, "Unauthorized! This is not your Lesson!")});
        }else {
            lessons_model.delete(id)
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

lessons_router.get("/metadata/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2003, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    lessons_model.metadata(id)
    .then(function(metadata) {
        res.json({"metadata":metadata});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

lessons_router.get("/content/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2004, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    lessons_model.content(id)
    .then(function(content) {
        res.json({"content":content});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});


lessons_router.post("/setname/", function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2004, "Missing Parameters! You should add an id parameter!")});
        return;
    }  
    if(name === undefined) {
        res.status(400).send({"error":buildError(400, 2004, "Missing Parameters! You should add an name parameter!")});
        return;
    }  
    lessons_model.owner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 2012, "Unauthorized! This is not your Lesson!")});
        }else {
            lessons_model.setname(id, name)
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

lessons_router.post("/setprivate/", function(req, res) {
    var id = req.body.id;
    var private = req.body.private;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2004, "Missing Parameters! You should add an id parameter!")});
        return;
    }  
    if(private === undefined) {
        res.status(400).send({"error":buildError(400, 2004, "Missing Parameters! You should add an private parameter!")});
        return;
    }
    if(private !== 0 && private !== 1) {
        res.status(400).send({"error":buildError(400, 2004, "private should be 0 or 1")});
        return;
    }
    lessons_model.owner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 2012, "Unauthorized! This is not your Lesson!")});
        }else {
            lessons_model.setprivate(id, private)
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

lessons_router.post("/setlang/", function(req, res) {
    var id = req.body.id;
    var n_lang = req.body.n_lang;
    var f_lang = req.body.f_lang;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2004, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    if(n_lang === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an n_lang parameter!")});
        return;
    }
    if(f_lang === undefined) {
        res.status(400).send({"error":buildError(400, 2000, "Missing Parameters! You should add an f_lang parameter!")});
        return;
    }    
    lessons_model.owner(id)
    .then(function(user) {
        if(user != req.userid) {
            res.status(401).send({"error":buildError(401, 2012, "Unauthorized! This is not your Lesson!")});
        }else {
            lessons_model.setlang(id, n_lang, f_lang)
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

lessons_router.get("/user/", function(req, res) {
    lessons_model.user(req.userid)
    .then(function(result) {
        res.json({"lessons":result});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

lessons_router.get("/usermetadata/", function(req, res) {
    lessons_model.usermetadata(req.userid)
    .then(function(result) {
        res.json({"lessons":result});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

lessons_router.get("/search/", function(req, res) {
    var regex = req.query.regex;
    if(regex === undefined) {
        res.status(400).send({"error":buildError(400, 2005, "Missing Parameters! You should add an regex parameter!")});
        return;
    }
    lessons_model.search(regex, req.userid)
    .then(function(result) {
        res.json({"lessons":result});
    }).catch(function(err) {
        console.log(err);
        res.status(err["httpcode"]).send({"error":err});
    });
});

lessons_router.post("/setrating/", function(req, res) {
    var id = req.body.id;
    var rating = req.body.rating;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2005, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    if(rating === undefined) {
        res.status(400).send({"error":buildError(400, 2005, "Missing Parameters! You should add an rating parameter!")});
        return;
    }
    if(rating < 1 || rating > 5) {
        res.status(400).send({"error":buildError(400, 2005, "Rating should be between 1 and 5")});
        return;
    }
    lessons_model.setRating(req.userid, id, rating)
    .then(function() {
        res.end();
    }).catch(function(err) {
        console.log(err);
        res.status(err["httpcode"]).send({"error":err});
    });
});

lessons_router.get("/rating/", function(req, res) {
    var id = req.query.id;
    if(id === undefined) {
        res.status(400).send({"error":buildError(400, 2005, "Missing Parameters! You should add an id parameter!")});
        return;
    }
    lessons_model.rating(id, req.userid)
    .then(function(result) {
        res.json({"rating":result});
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

module.exports = lessons_router;
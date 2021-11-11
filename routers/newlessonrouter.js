var express = require("express");
var lessons_router = express.Router();
const Database = require("../models/database");
let {ObjectId} = require("mongodb");
const builderror = require("../builderror");

lessons_router.get("/:lessonid", function(req, res) {  
    if (!ObjectId.isValid(req.params.lessonid)) { res.send(builderror(400, 1000, "No Valid ID!")); return; }
    Database.db.collection('lessons').find({"_id":new ObjectId(req.params.lessonid)}).toArray().then((lessons) => {
        res.send(lessons);
    }).catch((error) => {
        res.send(builderror(500, 1001, error))
    });
});

lessons_router.post("/:lessonname", function(req, res) {
});

lessons_router.get("/:lessonid/metadata", function(req, res) {
    if (!ObjectId.isValid(req.params.lessonid)) { res.send(builderror(400, 1000, "No Valid ID!")); return; }
    Database.db.collection('lessons').find({"_id":new ObjectId(req.params.lessonid)}).toArray().then((lessons) => {
        res.send(lessons);
    }).catch((error) => {
        res.send(builderror(500, 1001, error))
    });
});

lessons_router.post("/:lessonid/name/:name", function(req, res) {

});

lessons_router.post("/:lessonid/n_lang/:n_lang", function(req, res) {

});

lessons_router.post("/:lessonid/f_lang/:f_lang", function(req, res) {

});

lessons_router.get("/:lessonid/content/:vocableids?", function(req, res) {

});

lessons_router.put("/:lessonid/content/:vocableids?", function(req, res) {

});

lessons_router.post("/:lessonid/content/:vocableids?", function(req, res) {

});
module.exports = lessons_router;
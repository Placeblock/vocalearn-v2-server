var express = require("express");
const fileUpload = require('express-fileupload');
var api_router = express.Router();

const token_router = require("./routers/token_router");
const authentication_router = require("./routers/authentication_router");
const user_router = require("./routers/user_router");
var friend_router = require("./routers/friend_router");
var statistics_router = require("./routers/statistics_router");
var lesson_router = require("./routers/lesson_router");
var vocable_router = require("./routers/vocable_router");
const selection_router = require("./routers/selection_router");

api_router.use(express.json());
api_router.use("*", express.static(__dirname + '../apidoc/'))

api_router.use("/token", token_router);
api_router.use("*", authentication_router);
api_router.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    createParentPath: true
}));
api_router.use("/user", user_router);
api_router.use("/friend", friend_router);
api_router.use("/lesson", lesson_router);
api_router.use("/selection", selection_router);
api_router.use("/vocable", vocable_router);
api_router.use("/statistics", statistics_router);

module.exports = api_router;
var express = require("express");
var doc_router = express.Router();

doc_router.use("/", express.static(__dirname + '/apidoc/'))

module.exports = doc_router;
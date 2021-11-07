const db = require("./database.js");
const buildError = require("../builderror");

exports.create = (user, name) => {
    return new Promise(function(resolve, reject) {
        var sql = "INSERT INTO selections (name, owner_id) VALUES (?,?)";
        db.query(sql, [name, user], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 3100, "Database Error: " + error));
                return;
            }
            var selection = result.insertId;
            resolve(selection);
        });
    });
}

exports.delete = (id) => {
    return new Promise(function(resolve, reject) {
        var sql = "DELETE FROM selections WHERE id = ?";
        db.query(sql, [id], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 3101, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}

exports.addlesson = (id, lesson ) => {
    return new Promise(function(resolve, reject) {
        var sql = "INSERT INTO selections_data (selection_id, lesson_id) VALUES (?,?)";
        db.query(sql, [id, lesson], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 3102, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}

exports.removelesson = (id, lesson) => {
    return new Promise(function(resolve, reject) {
        var sql = "DELETE FROM selections_data WHERE selection_id = ? AND lesson_id = ?";
        db.query(sql, [id, lesson], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 3103, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}

function metadata(id) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT name, owner_id, created FROM selections WHERE id=?";
        db.query(sql, [id], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 3104, "Database Error: " + error));
                return;
            }
            if(rows.length == 0) {
                reject(buildError(400, 3105, "There is no selection with that id"));
                return;
            }
            result = {"name":rows[0]["name"],"created":rows[0]["created"]};
            resolve(result);
        });
    });
}
exports.metadata = metadata;

function content(id) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT lesson_id FROM selections_data WHERE selection_id = ?";
        db.query(sql, [id], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 3106, "Database Error: " + error));
                return;
            }
            result = [];
            for(row of rows) {
                result.push(row["lesson_id"]);
            }
            resolve(result);
        });
    });
}
exports.content = content;


const vocable_model = require("./vocable_model");
function vocables(id) {
    return new Promise(async function(resolve, reject) {
        var sql = " SELECT vokabeln.id, lessons.n_lang, lessons.f_lang FROM vokabeln INNER JOIN lessons ON vokabeln.lesson_id=lessons.id INNER JOIN selections_data ON selections_data.lesson_id=lessons.id INNER JOIN selections ON selections.id=selections_data.selection_id WHERE selections.id=?";
        db.query(sql, [id], async function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 3106, "Database Error: " + error));
                return;
            }
            result = {};
            for(row of rows) {
                const content = vocable_model.content(row["id"]);
                result[row["id"]] = {"n_lang":row["n_lang"],"f_lang":row["f_lang"],"content":content};
            }
            resolve(result);
        });
    });
}
exports.vocables = vocables;

const lesson_model = require("./lesson_model");
function contentmetadata(id) {
    return new Promise(async function(resolve, reject) {
        try {
            var result = await content(id);
            var lessons = {};
            for(id of result) {
                lessons[id] = await lesson_model.metadata(id);
            }
            resolve(lessons);
        } catch(e) {
            console.log(e);
            reject(e);
        }
    });
}
exports.contentmetadata = contentmetadata;


function usermetadata(userid) {
    return new Promise(async function(resolve, reject) {
        try {
            userids = await user(userid);
            var selections = {};
            for(id of result) {
                selections[id] = await metadata(id);
            }
            resolve(selections);
        } catch(e) {
            console.log(e);
            reject(e);
        }

    });
}
exports.usermetadata = usermetadata;

function user(user) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT id FROM selections WHERE owner_id = ?";
        db.query(sql, [user], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 3108, "Database Error: " + error));
                return;
            }
            result = [];
            for(row of rows) {
                result.push(row["id"]);
            }
            resolve(result);
        });
    });
}
exports.user = user;

exports.owner = (id) => {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT owner_id FROM selections WHERE id = ?";
        db.query(sql, [id], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 3109, "Database Error: " + error));
                return;
            }
            if(rows.length == 0) {
                reject(buildError(400, 3110, "There is no selection with that id"));
                return;
            }
            resolve(rows[0]["owner_id"]);
        });
    });
}
const db = require("./database.js");
const buildError = require("../builderror");


function create(name, private, user) {
    return new Promise(function(resolve, reject) {
        var sql = "INSERT INTO lessons (owner_id, private, name) VALUES(?, ?, ?)";
        db.query(sql, [user, private, name], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 2100, "Database Error: " + error));
                return;
            }
            var lesson = result.insertId;
            resolve(lesson);
        });
    });
}
exports.create = create;

function ddelete(lessonid) {
    return new Promise(function(resolve, reject) {
        var sql = "DELETE FROM lessons WHERE id=?";
        db.query(sql, [lessonid], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 2101, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.delete = ddelete;

const authentication_model = require("./authentication_model");
function metadata(lessonid, userid=undefined) {
    return new Promise(async function(resolve, reject) {
        var sql = "SELECT owner_id, name, private, creation_date, n_lang, f_lang FROM lessons WHERE id=?";
        db.query(sql, [lessonid], async function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 2102, "Database Error: " + error));
                return;
            }
            if(rows.length == 0) {
                reject(buildError(400, 2103, "There is no lesson with that id"));
                return;
            }
            const owner_name = await authentication_model.namebyuser(rows[0]["owner_id"]);
            var drating = await rating(lessonid, userid);
            result = {"name":rows[0]["name"],
                      "creation_date":rows[0]["creation_date"], 
                      "owner_name": owner_name, 
                      "owner_id": rows[0]["owner_id"],
                      "rating": drating,
                      "private": rows[0]["private"],
                      "n_lang": rows[0]["n_lang"],
                      "f_lang": rows[0]["f_lang"]};
            resolve(result);
        });
    });
}
exports.metadata = metadata;


function content(lessonid) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT id,n_text,f_text,hint FROM vokabeln WHERE lesson_id=?";
        db.query(sql, [lessonid], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 2104, "Database Error: " + error));
                return;
            }
            content = {};
            for(row of rows) {
                content[row["id"]] = {
                    "n_text": row["n_text"],
                    "f_text": row["f_text"],
                    "hint": row["hint"]
                };
            }
            resolve(content);
        });
    });
}
exports.content = content;

function setlang(id, n_lang, f_lang) {
    return new Promise(function(resolve, reject) {
        var sql = "UPDATE lessons SET n_lang = ?, f_lang = ? WHERE id=?";
        db.query(sql, [n_lang, f_lang, id], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 2101, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.setlang = setlang;

function setname(id, name) {
    return new Promise(function(resolve, reject) {
        var sql = "UPDATE lessons SET name = ? WHERE id=?";
        db.query(sql, [name, id], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 2101, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.setname = setname;

function setprivate(id, private) {
    return new Promise(function(resolve, reject) {
        var sql = "UPDATE lessons SET private = ? WHERE id=?";
        db.query(sql, [private, id], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 2101, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.setprivate = setprivate;

function usermetadata(userid) {
    return new Promise(async function(resolve, reject) {
        try {
            userids = await user(userid);
            var lessons = {};
            for(id of result) {
                lessons[id] = await metadata(id);
            }
            resolve(lessons);
        } catch(e) {
            console.log(e);
            reject(e);
        }

    });
}
exports.usermetadata = usermetadata;

function user(user) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT id FROM lessons WHERE owner_id = ?";
        db.query(sql, [user], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 2105, "Database Error: " + error));
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

function search(regex, userid=undefined) {
    return new Promise(async function(resolve, reject) {
        var sql = "SELECT id FROM lessons WHERE private = 0 AND name REGEXP " + db.escape(regex);
        db.query(sql, async function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 2106, "Database Error: " + error));
                return;
            }
            var result = {};
            for(row of rows) {
                const lessonmetadata = await metadata(row["id"], userid);
                result[row["id"]] = lessonmetadata;
            }
            resolve(result);
        });
    });
}
exports.search = search;

function owner(id) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT owner_id FROM lessons WHERE id = ?";
        db.query(sql, [id], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 2107, "Database Error: " + error));
                return;
            }
            if(rows.length == 0) {
                reject(buildError(400, 2108, "There is no lesson with that id"));
                return;
            }
            resolve(rows[0]["owner_id"]);
        });
    });
}
exports.owner = owner;

function rating(id, userid=undefined) {
    return new Promise(async function(resolve, reject) {
        var sql = "SELECT user_id, lesson_id, rating FROM lesson_ratings WHERE lesson_id = ?";
        db.query(sql, [id], async function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 2107, "Database Error: " + error));
                return;
            }
            var result = {};
            var average = 0;
            result["ratings"] = {};
            result["user_rating"] = 0;
            for(var row of rows) {
                var username = await authentication_model.namebyuser(row["user_id"]);
                if(row["user_id"] === userid) {
                    result["user_rating"] = row["rating"];
                }
                result["ratings"][row["user_id"]] = {};
                result["ratings"][row["user_id"]]["rating"]  = row["rating"];
                result["ratings"][row["user_id"]]["name"]  = username;
                average += row["rating"];
            }
            if(rows.length !== 0) {
                average = average / rows.length;
            }
            result["average"] = average;
            resolve(result);
        });
    });
}
exports.rating = rating;

function setRating(userid, id, rating) {
    return new Promise(function(resolve, reject) {
        var sql = "INSERT INTO lesson_ratings (user_id, lesson_id, rating) VALUES(?,?,?) ON DUPLICATE KEY UPDATE rating=?";
        db.query(sql, [userid, id, rating, rating], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 2107, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}
exports.setRating = setRating;
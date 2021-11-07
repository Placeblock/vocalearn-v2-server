const db = require("./database.js");
const buildError = require("../builderror");


exports.create = (lesson, n_text, f_text, hint) => {
    return new Promise(function(resolve, reject) {
        var sql = "INSERT INTO vokabeln (lesson_id, n_text, f_text, hint) VALUES (?, ?, ?, ?)";
        db.query(sql, [lesson, n_text, f_text, hint], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 4100, "Database Error: " + error));
                return;
            }
            var vocable = result.insertId;
            resolve(vocable);
        });
    });
}

exports.delete = (id) => {
    return new Promise(function(resolve, reject) {
        var sql = "DELETE FROM vokabeln WHERE id=?";
        db.query(sql, [id], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 4101, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}

function content(id) {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT lesson_id, n_text, f_text, hint, creation FROM vokabeln WHERE id=?";
        db.query(sql, [id], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4102, "Database Error: " + error));
                return;
            }
            if(rows.length == 0) {
                reject(buildError(400, 4103, "There is no vocable with that id"));
                return;
            }
            resolve({
                "lesson_id":rows[0]["lesson_id"],
                "n_text":rows[0]["n_text"],
                "f_text":rows[0]["f_text"],
                "hint":rows[0]["hint"],
                "creation":rows[0]["creation"]});
        });
    });
}
exports.content = content;

exports.edit = (id, lesson, n_text, f_text, hint) => {
    return new Promise(function(resolve, reject) {
        var sql = "UPDATE vokabeln SET lesson_id = ?, n_text = ?, f_text = ?, hint = ? WHERE id=?";
        db.query(sql, [lesson, n_text, f_text, hint, id], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 4104, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}


exports.search = (regex, n_text_b, f_text_b, hint_b) => {
    return new Promise(async function(resolve, reject) {
        var sql = "SELECT id FROM vokabeln WHERE ("+n_text_b+" AND n_text REGEXP ?) OR ("+f_text_b+" AND f_text REGEXP ?) OR ("+hint_b+" AND hint REGEXP ?)";
        db.query(sql, [regex, regex, regex], async function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4105, "Database Error: " + error));
                return;
            }
            result = {};
            for(row of rows) {
                vocabledata = await content(row["id"]);
                result[row["id"]] = vocabledata;
            }
            resolve(result);
        });
    });
}

exports.owner = (id) => {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT owner_id FROM lessons INNER JOIN vokabeln ON lessons.id=vokabeln.lesson_id WHERE vokabeln.id = ? LIMIT 1;";
        db.query(sql, [id], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 4106, "Database Error: " + error));
                return;
            }
            if(rows.length == 0) {
                reject(buildError(400, 4107, "There is no vocable with that id"));
                return;
            }
            resolve(rows[0]["owner_id"]);
        });
    });
}
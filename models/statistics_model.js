const db = require("./database.js");
const buildError = require("../builderror");

exports.add = (user, vocable, known, direction) => {
    return new Promise(function(resolve, reject) {
        var sql = "call store_result (?, ?, ?, ?)";
        db.query(sql, [direction, user, vocable, known], function(error, result, fields) {
            if(error != null) {
                reject(buildError(500, 5100, "Database Error: " + error));
                return;
            }
            resolve();
        });
    });
}

exports.vocable = (user, vocable) => {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT f_flag,req_time,req_count,score FROM voc_states WHERE owner_id=? AND vokabel_id=?";
        db.query(sql, [user, vocable], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 5101, "Database Error: " + error));
                return;
            }

            statistics = {};
            for(row of rows) {
                statistics[row["f_flag"]]["req_time"] = row["req_time"];
                statistics[row["f_flag"]]["req_count"] = row["req_count"];
                statistics[row["f_flag"]]["score"] = row["score"];
            }
            resolve(statistics);
        });
    });
}

exports.lesson = (user, lesson) => {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT f_flag,req_time,req_count,score FROM voc_states INNER JOIN vokabeln ON voc_states.vokabel_id=vokabeln.id INNER JOIN lessons on vokabeln.lesson_id=lessons.id WHERE vokabeln.lesson_id=? AND lessons.owner_id=?";
        db.query(sql, [lesson, user], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 5102, "Database Error: " + error));
                return;
            }

            statistics = {};
            for(row of rows) {
                statistics[row["f_flag"]]["req_time"] = row["req_time"];
                statistics[row["f_flag"]]["req_count"] = row["req_count"];
                statistics[row["f_flag"]]["score"] = row["score"];
            }
            resolve(statistics);
        });
    });
}

exports.selection = (user, selection) => {
    return new Promise(function(resolve, reject) {
        var sql = "SELECT voc_states.f_flag,voc_states.req_time,voc_states.req_count,voc_states.score,lessons.n_lang,lessons.f_lang FROM voc_states INNER JOIN vokabeln ON voc_states.vokabel_id=vokabeln.id INNER JOIN lessons on vokabeln.lesson_id=lessons.id INNER JOIN selections_data ON lessons.id=selections_data.lesson_id INNER JOIN selections ON selections_data.selection_id=selections.id WHERE selections.id=? AND selections.owner_id=?";
        db.query(sql, [selection, user], function(error, rows, fields) {
            if(error != null) {
                reject(buildError(500, 5102, "Database Error: " + error));
                return;
            }
            statistics = {};
            for(row of rows) {
                statistics[row["f_flag"]]["req_time"] = row["req_time"];
                statistics[row["f_flag"]]["req_count"] = row["req_count"];
                statistics[row["f_flag"]]["score"] = row["score"];
                statistics[row["f_flag"]]["n_lang"] = row["n_lang"];
                statistics[row["f_flag"]]["f_lang"] = row["f_lang"];
            }
            resolve(statistics);
        });
    });
}
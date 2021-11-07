var express = require("express");
var token_router = express.Router();
var authentication_model = require("../models/authentication_model");
const buildError = require("../builderror");

token_router.post("/login/", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    if(email === undefined) {
        res.status(400).send({"error":buildError(400, 1000, "Missing Parameters! You should add an email parameter!")});
        return;
    }
    if(password === undefined) {
        res.status(400).send({"error":buildError(400, 1001, "Missing Parameters! You should add an password parameter!")});
        return;
    }
    authentication_model.userbyemail(email)
    .then(function(id) {
        authentication_model.checkcredentials(id, password)
        .then(function(correct) {
            if(correct) {
                authentication_model.createtoken(id)
                .then(function(token) {
                    res.json({"token":token});
                }).catch(function(err) {
                    res.status(err["httpcode"]).send({"error":err});
                });
            }else {
                res.status(401).send({"error":buildError(401, 1002, "Wrong credentials!")});
            }
        }).catch(function(err) {
            res.status(err["httpcode"]).send({"error":err});
        });
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

token_router.post("/logout/", (req, res) => {
    var token = req.body.token;
    if(token === undefined) {
        res.status(400).send({"error":buildError(400, 1003, "Missing Parameters! You should add an token parameter!")});
        return;
    }
    authentication_model.removetoken(token)
    .then(function(id) {
        res.end();
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

token_router.post("/register/", (req, res) => {
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;
    var passwordr = req.body.passwordr;
    if(email === undefined) {
        res.status(400).send({"error":buildError(400, 1004, "Missing Parameters! You should add an email parameter!")});
        return;
    }
    if(name === undefined) {
        res.status(400).send({"error":buildError(400, 1005, "Missing Parameters! You should add an name parameter!")});
        return;
    }
    if(password === undefined) {
        res.status(400).send({"error":buildError(400, 1006, "Missing Parameters! You should add an password parameter!")});
        return;
    }
    if(passwordr === undefined) {
        res.status(400).send({"error":buildError(400, 1007, "Missing Parameters! You should add an passwordr parameter!")});
        return;
    }
    if(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email) === false) {
        res.status(400).send({"error":buildError(400, 1008, "No valid Email")});
        return;
    }
    if(password !== passwordr) {
        res.status(400).send({"error":buildError(400, 1009, "The passwords should be the same!")});
        return;
    }
    if(/\d/.test(password) === false) {
        res.status(400).send({"error":buildError(400, 1010, "The password must contain at least one digit!")});
        return;
    }
    if(password.length < 6) {
        res.status(400).send({"error":buildError(400, 1011, "The password must have a length of at least 6!")});
        return;
    }
    authentication_model.userbyemail(email).then((userid) => {
        res.status(400).send({"error":buildError(400, 1012, "This user already exists!")});
    }).catch((error) => {
        if(error["httpcode"] === 400) {
            authentication_model.register(email, password, name.trim()).then(() => {
                res.end();
            }).catch((error) => {
                res.status(error["httpcode"]).send({"error":error});
            })
        }else {
            res.status(error["httpcode"]).send({"error":error});
        }
    })
});

token_router.post("/emailvalidate/", (req, res) => {
    var token = req.body.token;
    var email = req.body.email;
    if(token === undefined) {
        res.status(400).send({"error":buildError(400, 1013, "Missing Parameters! You should add an token parameter!")});
        return;
    }
    if(email === undefined) {
        res.status(400).send({"error":buildError(400, 1014, "Missing Parameters! You should add an email parameter!")});
        return;
    }
    authentication_model.getEmailValidateToken(email)
    .then(async function(dtoken) {
        if(dtoken === token) {
            await authentication_model.setEmailValidated(email);
            const userid = await authentication_model.userbyemail(email);
            await authentication_model.deleteEmailValidateToken(userid);
            res.end();
        }else {
            res.status(400).send({"error":buildError(400, 1015, "Invalid Token!")});
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

token_router.post("/resendvalidatemail/", (req, res) => {
    var email = req.body.email;
    if(email === undefined) {
        res.status(400).send({"error":buildError(400, 1016, "Missing Parameters! You should add an email parameter!")});
        return;
    }
    authentication_model.sendEmailValidateToken(email).then(function() {
        res.end();
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});


//######################### RESET PASSWORD

token_router.post("/resetpasswordmail/", (req, res) => {
    var email = req.body.email;
    if(email === undefined) {
        res.status(400).send({"error":buildError(400, 1017, "Missing Parameters! You should add an email parameter!")});
        return;
    }
    authentication_model.userbyemail(email).then((userid) => {
        authentication_model.resetPasswordMail(email, userid).then(function() {
            res.end();
        }).catch(function(err) {
            res.status(err["httpcode"]).send({"error":err});
        });
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    })
});

token_router.post("/passwordresetvalidate/", (req, res) => {
    var email = req.body.email;
    var token = req.body.token;
    if(email === undefined) {
        res.status(400).send({"error":buildError(400, 1017, "Missing Parameters! You should add an email parameter!")});
        return;
    }
    if(token === undefined) {
        res.status(400).send({"error":buildError(400, 1017, "Missing Parameters! You should add an token parameter!")});
        return;
    }
    authentication_model.getPasswordResetToken(email)
    .then(async function(dtoken) {
        if(dtoken === token) {
            const userid = await authentication_model.userbyemail(email);
            await authentication_model.setPasswordResetValidated(userid);
            res.end();
        }else {
            res.status(400).send({"error":buildError(400, 1015, "Invalid Token!")});
        }
    }).catch(function(err) {
        res.status(err["httpcode"]).send({"error":err});
    });
});

token_router.post("/setnewpassword/", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var passwordr = req.body.passwordr;
    var token = req.body.token;
    if(email === undefined) {
        res.status(400).send({"error":buildError(400, 1017, "Missing Parameters! You should add an email parameter!")});
        return;
    }
    if(password === undefined) {
        res.status(400).send({"error":buildError(400, 1017, "Missing Parameters! You should add an password parameter!")});
        return;
    }
    if(passwordr === undefined) {
        res.status(400).send({"error":buildError(400, 1017, "Missing Parameters! You should add an passwordr parameter!")});
        return;
    }
    if(token === undefined) {
        res.status(400).send({"error":buildError(400, 1017, "Missing Parameters! You should add an token parameter!")});
        return;
    }
    if(password !== passwordr) {
        res.status(400).send({"error":buildError(400, 1009, "The passwords should be the same!")});
        return;
    }
    if(/\d/.test(password) === false) {
        res.status(400).send({"error":buildError(400, 1010, "The password must contain at least one digit!")});
        return;
    }
    if(password.length < 6) {
        res.status(400).send({"error":buildError(400, 1011, "The password must have a length of at least 6!")});
        return;
    }
    authentication_model.userbyemail(email).then(async (userid) => {
        const validated = await authentication_model.isPasswordResetValidated(userid);
        if(validated !== 1) {
            res.status(400).send({"error":buildError(400, 1012, "Token not validated!")});
            return;
        }
        authentication_model.setnewpassword(userid, password).then(function() {
            res.end();
        }).catch(function(err) {
            console.log(err);
            res.status(err["httpcode"]).send({"error":err});
        });
    }).catch((err) => {
        res.status(err["httpcode"]).send({"error":err});
    })
});

module.exports = token_router;
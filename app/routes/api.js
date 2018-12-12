const express = require('express');
const https = require('https');
const fs = require('fs');
let api = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

//cc
api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());
api.use(morgan('dev'));

// certificat SSL
let options = {
    key: fs.readFileSync('./../../SSL/server.key'),
    cert: fs.readFileSync('./../../SSL/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
};


let serverHttps = https.createServer(options, api);
/***************************************/
const User = require('../models/user');
const UserLog = require('../models/userLog');
const UserHistory = require('../models/userHistory');
let config = require('../../config');
let bcrypt = require('bcrypt-nodejs');
let validator = require('email-validator');
let nodemailer = require('nodemailer');
const ytSearch = require('yt-search');
const Youtube = require('youtube-stream-url');
const YouTube2 = require('simple-youtube-api');
const youtube = new YouTube2('AIzaSyBXPHBDbxvRVBWtc_9AkDHiRtAk0q2ms_o');
const ytdl = require('ytdl-core');
const vidl = require('vimeo-downloader');
/*Vimeo variables*/
const Vimeo = require('vimeo').Vimeo;
const client = new Vimeo(config.CLIENT_ID, config.CLIENT_SECRET, config.ACCESS_TOKEN);

// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
const accountSid = 'AC765be5d355ca81506f732b0a311b1363';
const authToken = 'f2bb4924ba7d824f4c646b15c3df9072';
const sms = require('twilio')(accountSid, authToken);
//randomString generator
const randomstring = require("randomstring");


let dateLogin;

let secretKey = config.secretKey;


//for creating tokens
let jsonwebtoken = require('jsonwebtoken');

//user
let userConnected;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'agrevid@gmail.com',
        pass: 'Agrevid.com'
    }
});

function createToken(user) {
    let token = jsonwebtoken.sign({
        id: user._id,
        name: user.name,
        username: user.username,
        tel: user.tel,
        admin: user.admin
    }, secretKey, {
        //Le temps (ici 1h) où l'utilisateur peut rester connecté avant de devoir se reconnecter
        expiresIn: 3600
        // expiresIn: 20
    });

    return token;
}

function createTokenforUpdatePass(user, codeVerification) {
    let token = jsonwebtoken.sign({
        id: user._id,
        name: user.name,
        username: user.username,
        tel: user.tel,
        admin: user.admin,
        codev: codeVerification,
        useMyNumForSec: user.useMyNumForSec
    }, secretKey, {
        //Le temps où l'utilisateur peut rester connecté avant de devoir se reconnecter
        expiresIn: 600
    });

    return token;
}


api.post('/checkEmail', function (req, res) {
    if (validator.validate(req.body.username)) {
        res.json({
            checked: true
        });
    }
    else {
        res.json({
            checked: false
        });
    }
});

/*<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
//send url to updating pass
api.post('/userSendModifyPassToken', function (req, res) {

    //check mail
    if (validator.validate(req.body.username)) {

        User.findOne({
            username: req.body.username
        }).select('_id name username password tel admin useMyNumForSec').exec(function (err, user) {
            if (err) {
                res.send(err);
                console.log(err);
            }
            else if (user) {


                let token;
                let hasTel = false;

                //verifier si l'utilisateur possede un tel + active securité
                if (user.useMyNumForSec) {
                    //generer code de verification
                    codev = randomstring.generate(7);
                    //generer un token pour l'utulisateur
                    token = createTokenforUpdatePass(user, codev);
                    //envoyé le code de verification par sms
                    sms.messages
                        .create({
                            body: 'Agrevid your code verification is : ' + codev,
                            from: '+33756799166',
                            to: user.tel
                        })
                        .then(message => console.log(message.sid))
                        .done();

                    hasTel = true;


                }
                else {
                    //token without a code verification
                    token = createTokenforUpdatePass(user, '');

                }

                //envoiyé le lien de changement de pass
                //modifier le token pour savoir si l user possede la securité
                let sec;
                if (user.useMyNumForSec) sec = 1;
                else sec = 0;

                let mailOptions = {
                    from: 'agrevid@gmail.com',
                    to: user.username,
                    subject: 'lien de changement de mot de pass ',
                    text: 'https://localhost:3000/updatePass/' + token + '/' + sec
                };


                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });


                res.json({
                    message: "votre password a bien été envoyé, verifiez votre boite email!",
                    succed: true,
                    tel: hasTel

                });

            }
            else {
                res.json({
                    message: "email incorrect ou il n'existe pas!",
                    succed: false
                })
            }

        });
    }
    else {
        res.json({
            message: "format d'email incorrect! essayé a nouveau  xxx@xxx.xxx",
            succed: false
        })
    }
});

api.post('/signup', function (req, res) {
    let user = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        tel: req.body.tel,
        admin: req.body.admin,
        useMyNumForSec: req.body.useMyNumForSec
    });

    let token = createToken(user);

    if (user.tel == "") {
        user.tel = "-";
        user.useMyNumForSec = false;
    }

    user.save(function (err) {
        if (err) {
            res.send(err);
        }
        res.json({
            success: true,
            message: 'User has been created !',
            token: token
        });
    });
});


api.post('/login', function (req, res) {
    User.findOne({
        username: req.body.username
    }).select('_id name username password admin').exec(function (err, user) {
        if (err) throw err;
        if (!user) {
            res.send({message: "Email ou mot de passe incorrecte !"});
        } else if (user) {
            let validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
                res.send({message: "Email ou mot de passe incorrecte !"});
            } else {
                //Create a token for the login
                let token = createToken(user);
                res.json({
                    success: true,
                    message: "Successfully logged in !" + (new Date()).toLocaleString(),
                    token: token
                });

                //save date and time for login
                this.dateLogin = (new Date()).toLocaleString();
                let userLoginDate = new UserLog({
                    idUser: user._id,
                    log_In: this.dateLogin,
                    log_Out: "not yet"
                });

                userLoginDate.save();

            }
        }
    });
});

api.post('/logoutDate', function (req, res) {

    let myquery = {idUser: req.body.id, log_In: this.dateLogin};
    let newvalues = {$set: {log_Out: (new Date().toLocaleString())}};

    UserLog.updateOne(myquery, newvalues, function (err) {
        if (err)
            res.json({message: 'err'});
        else
            res.json({message: 'logout date is saved'});
    });

});


api.get('/isTokenValid/:token', function (req, res) {
    let token = req.params.token;
    //check if token exist
    jsonwebtoken.verify(token, secretKey, function (err, decoded) {
        if (err) {
            res.json({valid: false});
        } else {
            //all the info of user is down here after authentication
            res.json({valid: true});
        }
    });

})

/*UP : destination A*/
/*DOWN : destination B*/
//position of this middlware in the code is important !
//this middleware checks if the authenticity of the token
api.use(function (req, res, next) {
    // console.log("Somebody just came to our app !");
    let token = req.body.token || req.param('token') || req.headers['x-access-token'];
    //check if token exist
    if (token) {
        jsonwebtoken.verify(token, secretKey, function (err, decoded) {
            if (err) {
                res.status(403).send({success: false, message: "Failed to authenticate user"});
            } else {
                //all the info of user is down here after authentication
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.status(403).send({success: false, message: "No token provided"});
    }
});


//Destination B here !

api.post('/updateUserPassToken', function (req, res) {
    // decoder le token et recuperer le user
    let token = req.headers['x-access-token'];

    //check if token exist
    if (token) {
        jsonwebtoken.verify(token, secretKey, function (err, userInfoToken) {
            if (err) {
                console.log(err);

            }
            else {
                if (userInfoToken) {
                    //all the info of user is in var user

                    let passwordNew = bcrypt.hashSync(req.body.passwordNew, null, null);
                    let myquery = {_id: userInfoToken.id};
                    let newvalues = {$set: {password: passwordNew}};
                    if (userInfoToken.useMyNumForSec) {

                        if (req.body.codev == userInfoToken.codev) {

                            console.log('depasse code v');
                            // And modify the old one if the verification is correct

                            User.updateOne(myquery, newvalues, function (err) {
                                if (err)
                                    console.log(err);
                                else
                                    res.json({
                                        message: " new pass has been created !"


                                    });
                            })

                        }
                        else {
                            console.log('ne depasse code v');
                            res.json({
                                message: " verification code not valid !",
                                success: false


                            });

                        }
                    }
                    else {
                        // And modify the old one if the verification is correct

                        User.updateOne(myquery, newvalues, function (err) {
                            if (err)
                                console.log(err);
                            else
                                res.json({
                                    message: " new pass has been created !",


                                });
                        })
                    }

                }

            }
        });
    } else {
        res.json({
            success: false,
            message: "le lien de changement de mot de pass est expiré demander un nouveau lien"
        });

    }


});

api.get('/userhistorys', function (req, res) {
    UserHistory.find({idUser: req.decoded.id}, function (err, userHis) {
        if (userHis) {
            if (err) {
                res.send(err);
            }
            res.json(userHis);
        }
        else {
            res.json(new UserHistory());
        }
    });
});

api.post('/userhistorysParam', function (req, res) {

    User.findOne({
        username: req.body.username
    }).select('username').exec(function (err, user) {
        if (user) {
            UserHistory.find({idUser: user._id}, function (err, userHis) {
                if (err) {
                    res.json(err);

                }
                if (userHis.length == 0) res.json({request_Video: 'No Date', request_date: 'No Date'});
                else res.json(userHis);
            })
        }
        else {
            res.json(new UserHistory());
        }
    })
});

api.get('/me', function (req, res) {
    res.json(req.decoded);
});

api.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        if (users) {
            if (err) {
                res.send(err);
            }
            res.json(users);
        }
        else {
            res.json(new User());
        }
    });
});

api.post('/user', function (req, res) {
    User.find({username: req.body.username}, function (err, user) {
        if (user) {
            if (err) {
                res.send(err);
            }

            res.json(user);
        }
        else {
            res.json(new User());
        }
    });
});

api.get('/userLoggs', function (req, res) {
    UserLog.find({idUser: req.decoded.id}, function (err, userLoggs) {
        if (userLoggs) {
            if (err) {
                res.send(err);
            }

            res.json(userLoggs);
        }
        else {
            res.json(new UserLog());
        }
    });
});

api.post('/searchUserLoggs', function (req, res) {
    User.findOne({
        username: req.body.username
    }).select('username').exec(function (err, user) {
        if (user) {
            UserLog.find({idUser: user._id}, function (err, userLoggs) {
                if (err) {
                    res.send(err);
                }
                res.json(userLoggs);
            });
        }
        else {
            res.json(new UserLog());
        }

    })

});

//ATTENTION : FAILLE => il faut privilégier cette méthode à l'administrateur seul
api.post('/deleteUser', function (req, res) {
    User.deleteOne({username: req.body.username}, function (err) {
        if (err)
            console.log(err);
        else
            res.json({message: 'Utilisateur supprimé', success: true});
    });
});

api.post('/updateUser', function (req, res, next) {
    let myquery = {_id: req.decoded.id};
    let newvalues;
    let successReturn = false;
    let msg;
    let newEmail;
    let newName;

    console.log(msg + ">>>>>>>>>>>>>>>>>>");
    if ((req.body.name + "" === 'undefined') && (req.body.email + "" === 'undefined')) {
        msg = "Aucune modification n'as été prise en charge, veuillez renseigner les champs demandés.";
        successReturn = false;

    }
    else if (req.body.name + "" !== 'undefined' && req.body.email + "" === 'undefined') {
        newvalues = {$set: {name: req.body.name}};
        msg = "Votre nom est bien modifié";
        successReturn = true;


    }

    else if (req.body.name + "" === 'undefined' && req.body.email + "" !== 'undefined') {
        newvalues = {$set: {username: req.body.email}};
        msg = "Votre email est bien modifié";
        successReturn = true;


    }
    else if (req.body.name + "" !== 'undefined' && req.body.email + "" !== 'undefined') {
        newvalues = {$set: {name: req.body.name, username: req.body.email}};
        msg = "Votre email et nom sont bien modifiés";
        successReturn = true;


    }


    if (successReturn) {
        User.updateOne(myquery, newvalues, function (err) {
            if (err)
                console.log(err);


            else {

                res.json({message: msg, success: true});

            }


        })
    } else res.json({message: msg, success: false});


});
/*<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
api.post('/updateUserPass', function (req, res) {
    User.findOne({
        _id: req.decoded.id
    }).select('_id name username password admin').exec(function (err, user) {
        if (err) res.send({message: "err select"});

        if (!user) {
            res.json({message: "L'utilisateur n'existe pas !",
                success:false});
        } else if (user) {
            let validPassword = user.comparePassword(req.body.passwordOld);
            if (!validPassword) {
                res.json({message: "Ancien mot de passe incorrecte !",success:false});

            } else {
                // create the new pass
                let passwordlod = user.password;
                let passwordNew = bcrypt.hashSync(req.body.passwordNew, null, null);

                // And modify the old one
                let myquery = {_id: req.decoded.id};
                let newvalues = {$set: {password: passwordNew}};
                User.updateOne(myquery, newvalues, function (err) {
                    if (err)
                        console.log(err);
                    else
                        res.json({
                            message: "Votre mot de passe a bien été modifié !",
                            success:true
                        });
                })

            }
        }
    })
});


/********************************************/
serverHttps.listen(3001, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Listening on port 3001");
    }
});

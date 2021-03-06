/**
 * @file api qui gère tout ce qui est en relation avec l'utilisateur(authentification, historique,logs).
 * @author berrada omar, echarifi idrissi zouhir, sergio galan-delea
 */
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


/**
 * Crée un token d'authentification pour l'utilisateur
 * @param user
 * @returns {string} token
 */
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


/**
 * le nouveau token d'utilisateur qui sera inclus dans un lien de changemennt de mot de passe .
 * @async
 * @function createTokenforUpdatePass
 * @param {user} user - information d'utilisateur .
 * @param {string} codeVerification - le code de verification envoyé sur le tel d'utilisatuer pour les comptes sécurisé .
 * @return {string} token - .
 */
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

/**
 * Middleware qui authorise l'accès à l'application TODOLIST
 */
api.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8095');

    /* //Request methods you wish to allow
     res.setHeader("Access-Control-Allow-Methods", "POST");

     //Request headers you wish to allow
     res.setHeader("Access-Control-Allow-Headers", "X-requested-with,content-type");*/

    next();
})


/**
 * Vérifie le format de l'email rentré
 *
 * @async
 * @function checkEmail
 * @param {string} username - email de l'utilisateur.
 * @return {json.<object>} checked - booléen informant sur la validité du format de l'email.
 */
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


/**
 *envoyé le lien de changement de mot de passe a l'utilisateur .
 *@async
 *@function userSendModifyPassToken
 *@param{string}  username
 *@return {string} message -message concernant le succès de l'operation.
 */
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

/**
 * méthode pour l'inscription des clients
 *
 * @async
 * @function signup
 * @param {string} name - nom de l'utlisateur.
 * @param {string} username - l'adresse mail de l'utlisateur.
 * @param {string} password - mot de passe.
 * @param {string} tel - numéro de téléphone.
 * @param {string} admin - renseigne si l'utlisateur est admin ou pas (non admin par défaut).
 * @param {boolean} useMyNumForSec - booléen disant si l'utlisateur veut renforcer sa sécurité avec son numéro de téléphone.
 * @return {json.<object>} message indiquant le succés de l'opération.
 */
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
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + user.tel);
    if (user.tel + "" === 'undefined') {
        user.tel = "-";
        user.useMyNumForSec = false;
    }
    let succedSave = false;
    user.save(function (err) {
        if (err) {
            res.json({success: false, token: ''});

        }
        else {
            res.json({success: true, token: token});
        }
    });

});

/**
 * méthode pour l'authentification des clients
 *
 * @async
 * @function login
 * @param {string} username - l'adresse mail de l'utlisateur.
 * @param {string} password - mot de passe.
 * @return {json.<object>} message indiquant le succés de l'opération.
 */
api.post('/login', function (req, res) {
    User.findOne({
        username: req.body.username
    }).select('_id name username password tel admin').exec(function (err, user) {
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

/**
 * méthode qui sauvegarde la date de déconnexion des clients
 *
 * @async
 * @function logoutDate
 * @param {string} id - l'adresse mail de l'utlisateur.
 * @return {json.<object>} message indiquant le succés de l'opération.
 */
api.post('/logoutDate', function (req, res) {

    let myquery = {idUser: req.body.id, log_In: this.dateLogin};
    console.log(myquery);
    let newvalues = {$set: {log_Out: (new Date().toLocaleString())}};
    console.log(newvalues);

    UserLog.updateOne(myquery, newvalues, function (err) {
        if (err)
            res.json({message: 'err'});
        else
            res.json({message: 'logout date is saved'});
    });

});

/**
 * méthode qui vérifie l'authenticité du token de l'utilisateur
 *
 * @async
 * @function isTokenValid
 * @param {string} token - token de l'utlisateur.
 * @return {json.<object>} message indiquant le succés de l'opération.
 */
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


/**
 * Middelware qui vérifie l'authenticité du token avant d'accéder aux opérations à risque
 */
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
/**
 *changement de mot de passe via l'utilisation de lien envoiyé a l'utilisateur
 *@async
 *@function updateUserPassToken
 *@param {string} token - le token qui est inclu dans le lien de changement de passe.
 *@return {string} message - message concerant le succès de l'operation.
 */
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


/**
 *  récuperer la list<> des mots clé cherché par l'utilisateur qui est enligne.
 *@async
 *@function userhistorys
 *@param {string} id - le id d'utilisateur qui ent enligne.
 *@return {json.<object>}  listHistory - .
 */
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
/**
 * chercher la list<> des mots clé cherché par un utilisateur .
 *@async
 *@function userhistorys
 *@param{string} username - email de l'utilisateur.
 *@return{json.<object>} listHistory.
 *
 */
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

/**
 * renvoie les informations concérnant l'utilisateur actuel
 *
 * @async
 * @function me
 * @param req.
 * @return {json.<object>} information concérnant l'utlisateur.
 */
api.get('/me', function (req, res) {
    res.json(req.decoded);
});

/**
 * renvoie tout les utilisateurs inscrits dans le site web
 *
 * @async
 * @function users
 * @return {json.<object>} information concérnant tous les utilisateurs.
 */
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

/**
 * renvoie les informations concérnant l'utilisateur recherché
 * @async
 * @function user
 * @param {username.<string>} adresse mail de l'utilisateur recherché.
 * @return {json.<object>} information concérnant l'utlisateur.
 */
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

/**
 *récuperer la list<> des logs de l'utilisateur .
 *@async
 *@function userLoggs
 *@param {string} id - le id d'utilisateur.
 *@return {json.<object>  listlogs .
 */
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
/**
 *supprimer un utilisateur.
 *@async
 *@function deleteUser
 *@param {string} email - l'email d'utilisateur .
 *@return {string}  message -mesage concerant le succés de l'operatiion.
 */
api.post('/deleteUser', function (req, res) {
    User.deleteOne({username: req.body.username}, function (err) {
        if (err)
            console.log(err);
        else
            res.json({message: 'Utilisateur supprimé', success: true});
    });
});

/**
 *modifier les information d'un utilisateur (nom,email).
 *@async
 *@function updateUser
 *@param {string} id - l'id d'utilisateur .
 *@return {string}  message -mesage concerant le succés de l'operatiion.
 */
api.post('/updateUser', function (req, res, next) {
    let myquery = {_id: req.decoded.id};
    let newvalues;
    let successReturn = false;
    let mdpValid = true;
    let msg;
    let newEmail;
    let newName;
    User.findOne({username: req.decoded.username}).select('password').exec(function (err, user) {
        if (!err) {
            let validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
                msg = "Mot de passe incorrecte !";
                mdpValid = false;
            }

            /****************/
            console.log(mdpValid);
            if (mdpValid === true) {


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


            /****************/

        }
    })


});
/*<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

/**
*activer ou désactiver la sécurité d'un compte .
*@async
*@function updateSecTel
*@param {string} id - l'id d'utilisateur .
*@return {string}  message -mesage concerant le succés de l'operatiion.
*/
api.post('/updateSecTel', function (req, res) {


    let numTel = "";
    let myquery = {_id: req.decoded.id};
    let newvalues;
    let sec = false;
    let secS;
    console.log(req.body.security);
    if (req.body.security + "" === 'undefined' || req.body.security === false) {
        secS = false;
    }
    else secS = req.body.security;
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + req.decoded.tel + "  " + req.body.tel);
    if (req.decoded.tel + "" === '-' && req.body.tel + "" !== 'undefined') {

        numTel = req.body.tel;
        newvalues = {$set: {tel: numTel, useMyNumForSec: secS}};
        // sec =true;
    }
    else if (req.decoded.tel + "" !== '-' && req.body.tel + "" !== 'undefined') {
        numTel = req.body.tel;
        newvalues = {$set: {tel: numTel, useMyNumForSec: secS}};
        // sec=true;

    } else if (req.decoded.tel + "" !== '-' && req.body.tel + "" === 'undefined') {
        numTel = req.decoded.tel;
        newvalues = {$set: {tel: numTel, useMyNumForSec: secS}};
        // sec=true;

    } else if (req.decoded.tel + "" === "-" && req.body.tel + "" === 'undefined') {
        //demande a l'user se saisir un num

        res.json({message: 'vous devez saisir un numeros de tel !', success: false});
    }

    // if(sec){
    User.updateOne(myquery, newvalues, function (err) {
        if (err)
            console.log(err);


        else {
            if (secS === 'true') {
                res.json({message: 'votre compte est bien sécurisé !', success: true});
            } else if (secS === 'false') {
                res.json({message: 'votre compte est non sécurisé !', success: false});
            }
            else if (!secS) {
                res.json({message: 'votre compte est non sécurisé !', success: false});
            }

        }

    })
    // }

})
/**
 *option de changement de mot de passe .
 *@async
 *@function updateUserPass
 *@param {string} id - l'id d'utilisateur .
 *@return {string}  message -mesage concerant le succés de l'operatiion.
 */
api.post('/updateUserPass', function (req, res) {
    User.findOne({
        _id: req.decoded.id
    }).select('_id name username password admin').exec(function (err, user) {
        if (err) res.send({message: "err select"});

        if (!user) {
            res.json({
                message: "L'utilisateur n'existe pas !",
                success: false
            });
        } else if (user) {
            let validPassword = user.comparePassword(req.body.passwordOld);
            if (!validPassword) {
                res.json({message: "Ancien mot de passe incorrecte !", success: false});

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
                            success: true
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

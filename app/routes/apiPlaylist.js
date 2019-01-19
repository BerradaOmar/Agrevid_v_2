/**
 * @file api qui gère tout ce qui est en relation avec les playlists de vidéos.
 * @author berrada omar, echarifi idrissi zouhir, sergio galan-delea
 */
const express = require('express');
const https = require('https');
const fs = require('fs');
let api = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

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
/********************************************/
const Playlist = require('../models/userPlaylist');
let config = require('../../config');

//for creating tokens
let jsonwebtoken = require('jsonwebtoken');
let secretKey = config.secretKey;

/**
 * permet de vérifier le token de l'utilisateur
 *
 * @function api.use
 * @param {object} req - requete
 * @param {string} req.body.token - contient le token
 * @param {string} req.param - contient le token
 * @param {string} req.headers - contient le token
 * @param {object} next - fonction à appeler si le token est valide
 * @return {object} res - réponse retournée
 * @return {boolean} res.success - renvoie si la fonction a fonctionné ou pas
 * @return {string} res.message - message de traitement
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

//-----------------------------------------------------------
//Playlist function
//-----------------------------------------------------------

/**
 * permet d'obtenir la liste des plaxlists de l'utilisateur
 *
 * @async
 * @function getPlaylist
 * @param {string} req.body.idUser - identificateur de l'utilisateur
 * @return {object} res - liste des playlists de l'utilisateur
 */
api.post('/getPlaylist', function (req, res) {
    Playlist.find({idUser: req.body.idUser}, function (err, userPlaylist) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(userPlaylist);
        res.json(userPlaylist);
    });
});


/**
 * permet d'ajouter une playlist vide pour l'utilisateur qui en fait la demande
 *
 * @async
 * @function createPlaylist
 * @param {string} req.body.idUser - identificateur de l'utilisateur
 * @param {string} req.body.namePlaylist - nom de la playlist à créer
 * @return {object} res - message de traitement à rendre et nom de la playlist concernée.
 *
 */
//Adds a new playlist
api.post('/createPlaylist',function (req, res) {
    const playlistData = req.body;
    const newPlaylist = new Playlist(playlistData);

    newPlaylist.save(function (err) {
        if (err) {
            console.log("Error:" + err);
            return;
        }
        else {
            //console.log("New Playlist created : " + playlistData.namePlaylist + " by user : " + playlistData.idUser);
            res.json({
                message : 'la playlist est crée avec succès !',
                name : playlistData.namePlaylist
            });
        }
    });
});


/**
 * permet de supprimer une des playlists de l'utilisateur
 *
 * @async
 * @function deletePlaylist
 * @param {string} req.body.idUser - identificateur de l'utilisateur
 * @param {string} req.body.namePlaylist - nom de la playlist à supprimer
 * @return {object} res - message de traitement.
 */
//Delete a playlist
api.post('/deletePlaylist',function (req, res) {
    Playlist.deleteOne({idUser: req.body.idUser, namePlaylist: req.body.namePlaylist}, function (err) {
        if (err)
            console.log(err);
        else
            res.json({message: 'la playlist est supprimée avec succès !'});
    });
});

/**
 * permet de ajouter une video à une playlist nommée de l'utilisateur
 *
 * @async
 * @function addVideoPlaylist
 * @param {string} req.body.idUser - identificateur de l'utilisateur
 * @param {string} req.body.namePlaylist - nom de la playlist dans laquelle est ajouté la vidéo
 * @param {string} req.body.url - url de la vidéo à ajouter à la playlist
 * @param {string} req.body.title - titre de la vidéo à ajouter à la playlist
 * @param {string} req.body.source - source de la vidéo à ajouter à la playlist
 * @param {string} req.body.image - image de la vidéo à ajouter à la playlist
 * @return {object} res - message de traitement.
 */
//Adds a new video to the playlist
api.post('/addVideoPlaylist',function (req, res) {
    Playlist.findOneAndUpdate({idUser: req.body.idUser ,namePlaylist: req.body.namePlaylist},
        {$addToSet: {playlist: {
                    url : req.body.url,
                    title : req.body.title,
                    source : req.body.source,
                    image : req.body.image
                }}},
        function (err, playlist) {
            if (err) {
                res.send(err);
            }
            else {
                console.log(req.body.url + " added to " + req.body.namePlaylist);
                res.send(playlist);
            }
        });
});


/**
 * permet de supprimer une vidéo nommée d'une playlist de l'utilisateur
 *
 * @async
 * @function deleteVideoPlaylist
 * @param {string} req.body.idUser - identificateur de l'utilisateur
 * @param {string} req.body.namePlaylist - nom de la playlist dans laquelle la vidéo sera supprimé
 * @param {string} req.body.video - vidéo à supprimer de la playlist
 * @return {object} res - message de traitement.
 */
//Delete a video from playlist
api.post('/deleteVideoPlaylist',function (req, res) {
    Playlist.findOneAndUpdate({ idUser: req.body.idUser, namePlaylist: req.body.namePlaylist},
        {$pull: {playlist: req.body.video}},
        function (err, playlist) {
            if (err) {
                res.send(err);
            }
            else {
                console.log(req.body.url + " removed from " + req.body.namePlaylist);
                res.send(playlist);
            }
        });
});


/********************************************/
serverHttps.listen(3003, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Listening on port 3003");
    }
});
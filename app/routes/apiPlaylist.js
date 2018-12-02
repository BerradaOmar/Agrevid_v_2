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
                message : 'la playlist est crée avec succès !'
            });
        }
    });
});

//Delete a playlist
api.post('/deletePlaylist',function (req, res) {
    Playlist.deleteOne({idUser: req.body.idUser, namePlaylist: req.body.namePlaylist}, function (err) {
        if (err)
            console.log(err);
        else
            res.json({message: 'la playlist est supprimée avec succès !'});
    });
});


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
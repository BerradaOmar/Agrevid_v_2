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
/***************************************/
const User = require('../models/user');
const UserLog = require('../models/userLog');
const UserHistory = require('../models/userHistory');
let config = require('../../config');
let validator = require('email-validator');
const ytSearch = require('yt-search');
const Youtube = require('youtube-stream-url');
const YouTube2 = require('simple-youtube-api');
const youtube = new YouTube2('AIzaSyBXPHBDbxvRVBWtc_9AkDHiRtAk0q2ms_o');
const ytdl = require('ytdl-core');
const vidl = require('vimeo-downloader');
/*Vimeo variables*/
const Vimeo = require('vimeo').Vimeo;
const client = new Vimeo(config.CLIENT_ID, config.CLIENT_SECRET, config.ACCESS_TOKEN);


let secretKey = config.secretKey;


//for creating tokens
let jsonwebtoken = require('jsonwebtoken');
let userData = '';

api.get('/search/:search', function (req, res) {
    let token = req.headers['x-access-token'];
    let search = req.params.search;
    //check if token exist
    if (token) {
        jsonwebtoken.verify(token, secretKey, function (err, decoded) {
            if (err) {
                res.status(403).send({success: false, message: "Failed to authenticate user"});
            } else {
                //all the info of user is down here after authentication
                req.decoded = decoded;
                userData = decoded;
                //need instance of history in order to add it while the search has been done
                let userH = new UserHistory({
                    idUser: req.decoded.id,
                    username: req.decoded.username,
                    request_Video: search,
                    request_date: new Date()
                });
                userH.save();
                res.json({
                   message : "Search history successfully added"
                });
            }
        });
    } else {
        res.status(403).send({success: false, message: "No token provided"});
    }
})


/*méthode qui cherche les videos de youtube*/
api.get('/searchYoutubeVideos/:search/:nextPageToken', function (req, res) {

    let search = req.params.search;
    let nextPageToken = req.params.nextPageToken;
    // console.log(search);
    //res.writeHead(200, {'Content-Type': 'video/mp4'});
    youtube.searchVideos(search, 25,{},nextPageToken)
        .then(function (results) {
            res.json({
                results : results.items,
                nextPageToken : results.nextPageToken,
                videoPerPage : results.pageInfo.resultsPerPage
            });
        })
        .catch(console.log);

})

/*méthode qui cherche les videos de vimeo*/
api.get('/searchVimeoVideos/:search/:page', function (req, res) {
    let search = req.params.search;
    let page = req.params.page;

    console.log("page : "+page);
    search = search.replace(/ /g, "+");
    // console.log(search);

    client.request(/*options*/{
        // This is the path for the videos contained within the staff picks
        // channels
        path: '/videos?query=' + search,
        // This adds the parameters to request page two, and 10 items per
        // page

        query: {
            page: page
        }

    }, /*callback*/function (error, body, status_code, headers) {
        if (error) {
            console.log('error');
            console.log(error);
        } else if (body && body.data[0] && body.data[0].link) {
            res.json({results: body.data});
        }

    })
})

/*méthode qui stream la video de youtube*/
api.get('/watchYoutubeVideo/:url', function (req, res) {
    let url = req.params.url;
    stream = ytdl('https://www.youtube.com/watch?v=' + url);

    res.on('pipe',function (source) {
        console.log('fired');
    })

    stream.pipe(res);
})



/*méthode qui stream la video de vimeo*/
api.get('/watchVimeoVideo/:url', function (req, res) {
    let url = req.params.url;
    if (url) {
        url = 'https://vimeo.com/' + url;
        /*Stream the video to the res*/

        let stream = vidl(url, {quality: '360p'});

        stream.pipe(res);

        stream.on('error', function (err) {
            console.error(err);
            console.info("Steam emit the error")
        });

        stream.on('data', function (chunk) {
        });

        stream.on('end', function () {
            console.log('Finished');
        });
    }
})


/********************************************/
serverHttps.listen(3002, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Listening on port 3002");
    }
});

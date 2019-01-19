const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const https = require('https');
/*const http = require('http');*/
const fs = require('fs');
let config = require('./config');
let app = express();
const YouTube2 = require('simple-youtube-api');
const youtube = new YouTube2('AIzaSyBXPHBDbxvRVBWtc_9AkDHiRtAk0q2ms_o');
const ytdl = require('ytdl-core');
let io_client = require('socket.io-client');
/*let socket = io_client.connect('https://agrevid.com:3001',{secure: true, reconnect: true, rejectUnauthorized : false});
socket.on('connect',()=>{
    console.log("connected to https://agrevid.com:3001");
});*/

// certificat SSL
let options = {
    key: fs.readFileSync('./SSL/server.key'),
    cert: fs.readFileSync('./SSL/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
};


/*let serverHttp = http.createServer(app);*/
let serverHttps = https.createServer(options, app);

let io = new require('socket.io')(serverHttps);

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

//for rendering static files (css / javascript)
app.use(express.static(__dirname + '/public'));


app.get('/doc/apivideo',function (req,res) {
    res.sendFile(__dirname + '/public/doc/apivideo/index.html');
});

app.get('/doc/apiauth',function (req,res) {
    res.sendFile(__dirname + '/public/doc/apiauth/index.html');
});

app.get('/doc/apiplaylist',function (req,res) {
    res.sendFile(__dirname + '/public/doc/apiplaylist/index.html');
});

let pilote = require('./app/pilote')(app,express);

/* /api is the root of our api, means that if we want to access the signup api
* we should type localhost:3000/api/signup */

app.use('/pilote',pilote);

//the parent file of the view pages (Angular routing)
app.use(function(req,res){
   res.sendFile(__dirname + '/public/app/views/index.html');
});


serverHttps.listen(config.port,function(err){
   if(err){
       console.log(err);
   } else{
       console.log("Listening on port 3000");
   }
});




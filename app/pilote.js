let request = require('request');
const fs = require('fs');
module.exports = function (app, express) {
    let api = express.Router();

    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


    /*REQUETES POUR API USER (api.js)*******************************************************/

    api.post('/checkEmail', function (req, res) {
        request.post({
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: 'https://agrevid.com:3001/checkEmail',
            form: {username: req.body.username}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })

    api.post('/userSendModifyPass', function (req, res) {
        request.post({
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: 'https://agrevid.com:3001/userSendModifyPass',
            form: {username: req.body.username}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })


    api.post('/signup', function (req, res) {
        request.post({
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: 'https://agrevid.com:3001/signup',
            form: {
                name: req.body.name,
                username: req.body.username,
                password: req.body.password,
                admin: false
            }
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })

    api.post('/login', function (req, res) {
        request.post({
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: 'https://agrevid.com:3001/login',
            form: {username: req.body.username, password: req.body.password}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })

    api.post('/logoutDate', function (req, res) {
        request.post({
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: 'https://agrevid.com:3001/logoutDate',
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })

    /*METHODS HERE NEEDS AUTHENTIFICATION*/
    api.get('/userhistorys', function (req, res) {
        request.get(
            {
                url: 'https://agrevid.com:3001/userhistorys',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'x-access-token': req.headers['x-access-token']
                }
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
                if (!error)
                    res.send(JSON.parse(response.body));
            });
    })

    api.post('/userhistorysParam', function (req, res) {
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-access-token': req.headers['x-access-token']
            },
            url: 'https://agrevid.com:3001/userhistorysParam',
            form: {username: req.body.username}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })


    api.get('/me', function (req, res) {
        request.get(
            {
                url: 'https://agrevid.com:3001/me',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'x-access-token': req.headers['x-access-token']
                }
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
                if (!error)
                    res.send(JSON.parse(response.body));
            });
    })

    api.get('/users', function (req, res) {
        request.get(
            {
                url: 'https://agrevid.com:3001/users',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'x-access-token': req.headers['x-access-token']
                }
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
                if (!error)
                    res.send(JSON.parse(response.body));
            });
    })

    api.post('/user', function (req, res) {
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-access-token': req.headers['x-access-token']
            },
            url: 'https://agrevid.com:3001/user',
            form: {username: req.body.username}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })


    api.get('/userLoggs', function (req, res) {
        request.get(
            {
                url: 'https://agrevid.com:3001/userLoggs',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'x-access-token': req.headers['x-access-token']
                }
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
                if (!error)
                    res.send(JSON.parse(response.body));
            });
    })

    api.post('/searchUserLoggs', function (req, res) {
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-access-token': req.headers['x-access-token']
            },
            url: 'https://agrevid.com:3001/searchUserLoggs',
            form: {username: req.body.username}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })


    api.post('/deleteUser', function (req, res) {
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-access-token': req.headers['x-access-token']
            },
            url: 'https://agrevid.com:3001/deleteUser',
            form: {username: req.body.username}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })

    api.post('/updateUser', function (req, res) {
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-access-token': req.headers['x-access-token']
            },
            url: 'https://agrevid.com:3001/updateUser',
            form: {name: req.body.name, email: req.body.email}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })

    api.post('/updateUserPass', function (req, res) {
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-access-token': req.headers['x-access-token']
            },
            url: 'https://agrevid.com:3001/updateUserPass',
            form: {passwordOld: req.body.passwordOld, passwordNew: req.body.passwordNew}
        }, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            if (!error)
                res.send(JSON.parse(response.body));
            // console.log(response);
        });
    })
    /******************************************************************************/
    /*REQUETES POUR API VIDEO (apiVideo.js)*******************************************************/
    api.get('/search/:token/:search', function (req, res) {
        request.get(
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                url: 'https://agrevid.com:3002/search/' + req.params.token + '/' + req.params.search + '',
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
                if (!error)
                    res.send(JSON.parse(response.body));
            });
    })

    api.get('/searchYoutubeVideos/:search', function (req, res) {
        request.get(
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                url: 'https://agrevid.com:3002/searchYoutubeVideos/' + req.params.search + '',
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
                if (!error)
                    res.json(JSON.parse(response.body));
            });
    })

    api.get('/searchVimeoVideos/:search', function (req, res) {
        request.get(
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                url: 'https://agrevid.com:3002/searchVimeoVideos/' + req.params.search + '',
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
                if (!error)
                    res.json(JSON.parse(response.body));
            });
    })

    api.get('/watchYoutubeVideo/:url', function (req, res) {
        request.get(
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                url: 'https://agrevid.com:3002/watchYoutubeVideo/' + req.params.url + '',
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
            }).pipe(res);
    })

    api.get('/watchVimeoVideo/:url', function (req, res) {
        request.get(
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                url: 'https://agrevid.com:3002/watchVimeoVideo/' + req.params.url + '',
            }
            , function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
            }).pipe(res);
    })

    api.get('/watchVideo/:src/:url', function (req, res) {
        if (req.params.src === 'youtube') {
            request.get(
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                    },
                    url: 'https://agrevid.com:3002/watchYoutubeVideo/' + req.params.url + '',
                }
                , function (error, response, body) {
                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log('body:', body); // Print the HTML for the Google homepage.
                }).pipe(res);
        } else if (req.params.src === 'vimeo') {
            request.get(
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                    },
                    url: 'https://agrevid.com:3002/watchVimeoVideo/' + req.params.url + '',
                }
                , function (error, response, body) {
                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log('body:', body); // Print the HTML for the Google homepage.
                }).pipe(res);
        }
    })


    /******************************************************************/

    return api;
}

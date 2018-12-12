angular.module('appRoutes',['ngRoute'])

.config(function($routeProvider,$locationProvider){
    $routeProvider
        .when('/',{
            templateUrl: 'app/views/pages/home.html'
        })
        .when('/login',{
            templateUrl: 'app/views/pages/login.html'
        })

        .when('/signup',{
            templateUrl: 'app/views/pages/signup.html'
        })

        .when('/administration',{
            templateUrl: 'app/views/pages/administration.html'
        })
        .when('/gestion',{
            templateUrl: 'app/views/pages/gestionDeComptes.html'
        })

        .when('/playlist',{
            templateUrl: 'app/views/pages/playlist.html'
        })

        /*.when('/logout',{
            templateUrl: 'app/views/pages/home.html'
        })*/

       /* .when('/video',{
            templateUrl: 'app/views/pages/videoStream.html'
        })

        .when('/videoVimeo',{
            templateUrl: 'app/views/pages/videoStreamVimeo.html'
        })*/

        .when('/search',{
            templateUrl: 'app/views/pages/search.html'
        })

        .when('/updatePass/:token/:code',{
            templateUrl : 'app/views/pages/updatePass.html',
            controller : 'UserController'
        })

        .when('/videoPlaylist',{
            templateUrl: 'app/views/pages/videoPlaylist.html'
        })


        .otherwise({redirectTo : '/'});

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');
})
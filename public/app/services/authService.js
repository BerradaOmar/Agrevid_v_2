angular.module('authService', [])


    .factory('Auth', function ($http, $q, AuthToken,$window) {

        let authFactory = {};


        authFactory.login = function (username, password) {
            return $http.post('/pilote/login', {
                username: username,
                password: password
            })
                .then(function (data) {
                    AuthToken.setToken(data.data.token);
                    return data.data;
                })
        }

        authFactory.logout = function (user) {
            return $http.post('/pilote/logoutDate', user).then(function (res) {
                return res.data;
            });
        }




        authFactory.isLoggedIn = function () {
                let token = AuthToken.getToken();
                return $http.get('/pilote/isTokenValid/'+token+'');
        }

        authFactory.userSendModifyPass = function (data) {
            return $http.post('/pilote/userSendModifyPassToken', data).then(function (res) {
                return res.data;
            });
        }

        authFactory.getUser = function () {
            if (AuthToken.getToken()){
                return $http.get('/pilote/me').then(function (res) {
                    return res.data;
                });
            }
            else
                return $q.reject({message: "User has no token"});
        }


        authFactory.checkInput = function (data){
            if(data.includes('$')){
                return true;
            }else{
                return false;
            }
        }

        return authFactory;
    })


    .factory('AuthToken', function ($window,$routeParams,$injector) {
        let authTokenFactory = {};

        authTokenFactory.getToken = function () {
            if($routeParams.token) {
                $window.localStorage.setItem('token', $routeParams.token);
                $routeParams.token = '';
                $routeParams.code='';
            }
            return $window.localStorage.getItem('token');
        }

        authTokenFactory.setToken = function (token) {
            if (token){
                $window.localStorage.setItem('token', token);
            }
            else
                $window.localStorage.removeItem('token');
        }


        return authTokenFactory;
    })

    .factory('AuthInterceptor', function ($q, $location, $window, AuthToken,$injector) {
        let interceptorFactory = {};

        interceptorFactory.request = function (config) {
            let token = AuthToken.getToken();
            if (token) {
                config.headers['x-access-token'] = token;
            }
            return config;
        };

        interceptorFactory.responseError = function (response) {
            if (response.status == 403) {
                $window.localStorage.setItem('token', '');
                $location.path('/login');
            }
            return $q.reject(response);
        }

        return interceptorFactory;

    });
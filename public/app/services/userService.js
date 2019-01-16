angular.module('userService',[])

.factory('User',function($http){
    let userFactory = {};

    userFactory.create = function(userData){
        return $http.post('/pilote/signup',userData).then(function (res) {
            return res.data;
        });
    }


    userFactory.updateSecTel=function(userData){
        return $http.post('/pilote/updateSecTel',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.all = function(){
        return $http.get('/pilote/users').then(function (res) {
            return res.data;
        });
    }

    userFactory.user = function(userData){
        return $http.post('/pilote/user',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.getUser = function(userData){
        return $http.post('/pilote/user',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.getHistorySearch = function () {
        return $http.get('/pilote/userhistorys').then(function (res) {
            return res.data;
        });
    }

    userFactory.getHistorySearchParam = function (userData) {
        return $http.post('/pilote/userhistorysParam',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.getLoggsParam = function (userData) {
        return $http.post('/pilote/searchUserLoggs',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.delete = function(userData){
        return $http.post('/pilote/deleteUser',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.update = function(userData){
        return $http.post('/pilote/updateUser',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.updateUserPass = function(userData){
        return $http.post('/pilote/updateUserPass',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.updateUserPassToken = function(userData){
        return $http.post('/pilote/updateUserPassToken',userData).then(function (res) {
            return res.data;
        });
    }

    userFactory.checkEmail = function(userData){
        return $http.post('/pilote/checkEmail',userData).then(function (res) {
            return res.data;
        });
    }

    return userFactory;
});
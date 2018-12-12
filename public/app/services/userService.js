angular.module('userService',[])

.factory('User',function($http){
    let userFactory = {};

    userFactory.create = function(userData){
        return $http.post('/pilote/signup',userData);
    }


    userFactory.updateSecTel=function(userData){
        return $http.post('/pilote/updateSecTel',userData);
    }

    userFactory.all = function(){
        return $http.get('/pilote/users');
    }

    userFactory.user = function(userData){
        return $http.post('/pilote/user',userData);
    }

    userFactory.getUser = function(userData){
        return $http.post('/pilote/user',userData);
    }

    userFactory.getHistorySearch = function () {
        return $http.get('/pilote/userhistorys');
    }

    userFactory.getHistorySearchParam = function (userData) {
        return $http.post('/pilote/userhistorysParam',userData);
    }

    userFactory.getLoggsParam = function (userData) {
        return $http.post('/pilote/searchUserLoggs',userData);
    }

    userFactory.delete = function(userData){
        return $http.post('/pilote/deleteUser',userData);
    }

    userFactory.update = function(userData){
        return $http.post('/pilote/updateUser',userData);
    }

    userFactory.updateUserPass = function(userData){
        return $http.post('/pilote/updateUserPass',userData);
    }

    userFactory.updateUserPassToken = function(userData){
        return $http.post('/pilote/updateUserPassToken',userData);
    }

    userFactory.checkEmail = function(userData){
        return $http.post('/pilote/checkEmail',userData);
    }

    return userFactory;
});
angular.module('MyApp',['appRoutes','mainCtrl','authService','userCtrl','userService','videoCtrl','videoService','playlistCtrl','playlistService','ui.bootstrap'])

.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptor');
});

angular.module('playlistService', [])

    .factory('Playlist', function ($http) {
        let userFactory = {};

        userFactory.create = function (idUser, namePlaylist) {
            return $http.post('/pilote/createPlaylist', {
                idUser: idUser,
                namePlaylist: namePlaylist
            });
        };

        userFactory.get = function (idUser) {
            return $http.post('/pilote/getPlaylist', {idUser: idUser});
        };

        userFactory.addVideo = function (idUser, namePlaylist, url, title,source,image) {
            return $http.post('/pilote/addVideoPlaylist', {
                idUser: idUser,
                namePlaylist: namePlaylist,
                url: url,
                title : title,
                source : source,
                image : image
            });
        };

        userFactory.deleteVideo = function (idUser, namePlaylist, video) {
            return $http.post('/pilote/deleteVideoPlaylist', {
                idUser: idUser,
                namePlaylist: namePlaylist,
                video: video
            });
        };

        userFactory.delete = function (idUser, namePlaylist) {
            return $http.post('/pilote/deletePlaylist', {
                idUser: idUser,
                namePlaylist: namePlaylist
            });
        };

        return userFactory;
    });
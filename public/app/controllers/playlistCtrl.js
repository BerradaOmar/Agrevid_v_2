angular.module('playlistCtrl', ['playlistService'])

    .controller('playlistCtrl', function (Playlist, User, Auth, $window, $location, $scope,$route) {
        let vm = this;
        $scope.array = [];
        $scope.arrayNomPlaylist = [];
        $scope.arrayplaylist = [];
        $scope.selectedPlaylist = [];
        $scope.selectedVideo = '';
        vm.userId = '';
        vm.playlistData = {};


        vm.createUserPlaylist = function () {
            vm.message = '';
            let charInterdits = ["\""];

            for (let i = 0; i < charInterdits.length; i++) {
                if (vm.playlistData.namePlaylist.includes(charInterdits[i])) {
                    $window.alert("Le nom de la playlist ne peut pas contenir de " + charInterdits[i]);
                    return;
                }
            }

            Auth.getUser().then(function (response) {
                vm.userId = response.data.id;

                Playlist.create(vm.userId, vm.playlistData.namePlaylist)
                    .then(function (response) {
                        vm.playlistData = {};
                        vm.message = response.data.message;
                    });
            });
            vm.getListPlaylist();
        };

        vm.getListPlaylist = function () {

            Auth.getUser().then(function (response) {
                vm.userId = response.data.id;
                $scope.array = [];
                $scope.arrayplaylist = [];
                $scope.arrayNomPlaylist = [];

                Playlist.get(vm.userId).then(function (res) {
                    console.log('Playlist recuperer ');

                    angular.forEach((res.data), function (element) {
                        $scope.array.push(element);
                        $scope.arrayplaylist.push(element.playlist);
                    });
                    angular.forEach($scope.array, function (element) {
                        $scope.arrayNomPlaylist.push((element.namePlaylist));
                    });
                });
                //$window.alert($scope.arrayplaylist);

            });

            //$route.reload();
        };
        vm.goToPlaylist = function () {
            vm.getListPlaylist();
            $location.path('/playlist');
        };


        vm.getListNomPlaylist = function () {
            vm.getListPlaylist();
            //$window.alert($scope.arrayNomPlaylist);
        };

        vm.deletePlaylist = function (namePlaylist) {
            Auth.getUser().then(function (response) {
                vm.userId = response.data.id;
                Playlist.delete(vm.userId, namePlaylist).success(function () {
                    vm.getListPlaylist();
                });
            });
        };
        vm.deletePlaylistBis = function (namePlaylist) {
            Auth.getUser().then(function (response) {
                vm.userId = response.data.id;
                Playlist.delete(vm.userId, namePlaylist).success(function () {
                    vm.getListPlaylist();
                    $location.path('/playlist');
                });
            });
        };

        vm.addVideo = function (playlist, url,title,source,image) {
            Auth.getUser().then(function (response) {
                vm.userId = response.data.id;
                Playlist.addVideo(vm.userId, playlist, url,title,source,image).success(function () {
                    vm.getListPlaylist();
                });
            });
        };

        vm.deleteVideo = function (playlist, video) {

            Auth.getUser().then(function (response) {
                vm.userId = response.data.id;
                Playlist.deleteVideo(vm.userId, playlist.namePlaylist, video).success(function () {
                    vm.getListPlaylist();
                });
            });
        };

        vm.deleteVideoBis = function (playlist, video) {

            Auth.getUser().then(function (response) {
                vm.userId = response.data.id;
                Playlist.deleteVideo(vm.userId, playlist.namePlaylist, video);

                vm.getListPlaylist();
                $scope.selectedPlaylist = [];
                for(let i=0; i<$scope.array.length;i++){
                    console.log($scope.array[i]);
                    if($scope.array[i].namePlaylist === playlist.namePlaylist){
                        console.log("here1 :"+$scope.selectedPlaylist);
                        $scope.selectedPlaylist = $scope.array[i];
                        console.log("here2 :"+$scope.selectedPlaylist.playlist);
                    }
                }

            });
            $location.path('/videoPlaylist');
        };


        vm.createAndAdd = function (playlist, url,title,source,image) {
            //vm.message = '';
            /*Auth.getUser().then(function(response){
                vm.userId = response.data.id;
                Playlist.create(vm.userId, playlist)
                    .success(function(response){
                        vm.message = response.data.message;
                        $window.alert('playlist '+ playlist +' a été créé');
                    });
                Playlist.addVideo(vm.userId, playlist,video).success(function () {
                    $window.alert('video ajouter à la playlist '+ playlist);
                });
            });*/
            vm.playlistData.namePlaylist = playlist;
            vm.createUserPlaylist();
            vm.addVideo(playlist, url,title,source,image);
        };

        vm.goToVideoPlaylist = function (playlist, video) {
            $scope.selectedPlaylist = [];
            $scope.selectedVideo = '';
            $scope.selectedPlaylist = playlist;
            $scope.selectedVideo = video;

            //$window.alert("playlist = " + $scope.selectedPlaylist.namePlaylist + " video = " + $scope.selectedVideo);

            $location.path('/videoPlaylist');
        };

        vm.goToVideoPlaylistBis = function (playlist, video) {
            vm.getListPlaylist();
            $scope.selectedPlaylist = [];
            $scope.selectedVideo = '';
                for(let i=0; i<$scope.array.length;i++){
                    console.log($scope.array[i]);
                    if($scope.array[i].namePlaylist === playlist.namePlaylist)
                        $scope.selectedPlaylist = $scope.array[i];
                }

            $scope.selectedVideo = video;

            //$window.alert("playlist = " + $scope.selectedPlaylist.namePlaylist + " video = " + $scope.selectedVideo);

            $location.path('/videoPlaylist');

        };


    });
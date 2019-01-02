angular.module('videoService',[])

.factory('Video',function($http,$window) {
    let videoFactory = {};

    videoFactory.url = '';

    /*videoFactory.search = function (search) {
        return $http.get('/api/streamYoutube/'+search.title);
    }*/

    videoFactory.setSearchTitle = function (searchTitle){
        if(searchTitle)
            $window.localStorage.setItem('search',searchTitle);
        else
            $window.localStorage.removeItem('search');
    }

    videoFactory.getSearchTitle = function (){
          return  $window.localStorage.getItem('search');

    }


    videoFactory.search = function (title) {
        return $http.get('/pilote/search/'+title);
    }

    videoFactory.searchYoutubeVideo = function(title,nextPageToken){
        return $http.get('/pilote/searchYoutubeVideos/'+title+'/'+nextPageToken);
    }

    videoFactory.searchVimeoVideo = function(title,page){
        return $http.get('/pilote/searchVimeoVideos/'+title+'/'+page);
    }

    return videoFactory;
});
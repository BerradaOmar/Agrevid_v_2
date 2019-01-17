angular.module('videoCtrl', ['videoService'])


    .controller('VideoController', function (Video, AuthToken, $window, $sce, $location, $route,$http,$q,$scope,$timeout,blockUI) {
        let vm = this;
        vm.url = '';
        vm.title = '\xa0\xa0\xa0';
        vm.videoSrc = '';
        vm.image = '';
        vm.youtubeList = true;
        vm.showVid = false;
        let nextPageToken = '';

        // vm.url = "https://r4---sn-n4g-hgnz.googlevideo.com/videoplayback?source=youtube&id=o-AGvY0HursJvaMI26QXpYkeAVD-bDkuc3E5jk7OvhJyEy&requiressl=yes&dur=225.047&pl=23&ip=34.211.145.200&txp=2211222&signature=74D2A92DB76667859A0B0D2E195362DE2B4E33E2.73CEDD01F5C2B33BE3779449A3AF9AC8B6065BD3&ratebypass=yes&fvip=4&ei=EzPQW5nbG5L-kgbQo6GAAw&c=WEB&mime=video%2Fmp4&itag=18&key=cms1&gir=yes&clen=9024154&sparams=clen,dur,ei,expire,gir,id,ip,ipbits,ipbypass,itag,lmt,mime,mip,mm,mn,ms,mv,pcm2cms,pl,ratebypass,requiressl,source&ipbits=0&expire=1540392819&lmt=1535622348334163&redirect_counter=1&rm=sn-nx5ld7z&fexp=23763603&req_id=73294e971bc5a3ee&cms_redirect=yes&ipbypass=yes&mip=78.113.113.141&mm=31&mn=sn-n4g-hgnz&ms=au&mt=1540371087&mv=m&pcm2cms=yes";

        vm.searchTitle = Video.getSearchTitle();
        vm.token = AuthToken.getToken();
        vm.youtubeVideos = [];
        vm.vimeoVideos = [];
        let vimeoPagination = 2;


        //trustSrc pour qu'Angular ne bloque pas les sources non fiables (externes)
        vm.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }

        vm.loadMoreVimeo = function(){
            let myBlockUI = blockUI.instances.get('myBlockUI');

            // Start blocking the element.
            myBlockUI.start();
            Video.searchVimeoVideo(vm.search.title,vimeoPagination).then(function(res){
                angular.forEach(res.data.results,function (elem) {
                    vm.vimeoVideos.push(elem);
                })
                vimeoPagination++;
                myBlockUI.stop();

            });
        }

        vm.loadMoreYoutube = function(){
            if(nextPageToken+"" !== 'undefined' ){
                Video.searchYoutubeVideo(vm.search.title,nextPageToken).then(async function(res){
                    await angular.forEach(res.data.results,function (elem) {
                        vm.youtubeVideos.push(elem);
                    })

                    // console.log(res.data.videoPerPage);

                    nextPageToken = res.data.nextPageToken;
                });
            }
        }

        //méthode déclanchée lors de la recherche de video
        vm.doSearch = function () {
            let myBlockUI = blockUI.instances.get('myBlockUI');

            // Start blocking the element.
            myBlockUI.start();


            Video.searchVimeoVideo(vm.search.title,1).then(function(res){
                vm.vimeoVideos = res.data.results;
                myBlockUI.stop();

            });

            Video.searchYoutubeVideo(vm.search.title,"sdfs").then(function (res) {

                $location.path('/search');

                vm.youtubeVideos = res.data.results;
                nextPageToken = res.data.nextPageToken;

                let regExLettres = new RegExp('^[a-zA-Z0-9-()/:?.= ]*$');

                if (!regExLettres.test(vm.search.title)) {
                    $window.alert("erreur !");
                    return;
                }
                // $localStorage.put('search',"https://agrevid.com:3000/api/streamVideo/"+vm.search.title);
                Video.search(vm.search.title);
                // Video.setSearchTitle(vm.search.title);

                // $route.reload();


            });



        }
        
        vm.streamYoutubeVideo = function (video) {
            vm.url = video.id.videoId;
            vm.title = video.snippet.title;
            vm.videoSrc = 'youtube';
            vm.image = video.snippet.thumbnails.medium.url;
            vm.showVid = true;
            // $location.path('/video');
            // $route.reload();
        }

        vm.streamVimeoVideo = function (video) {
            vm.url = video.link.substr(18);
            vm.title = video.name;
            vm.videoSrc = 'vimeo';
            vm.image = video.pictures.sizes[3].link;
            vm.showVid = true;

            // $location.path('/videoVimeo');
            // $route.reload();
        }


    })
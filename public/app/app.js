angular.module('MyApp', ['appRoutes', 'mainCtrl', 'authService', 'userCtrl', 'userService', 'videoCtrl', 'videoService', 'playlistCtrl', 'playlistService', 'ui.bootstrap', 'blockUI', 'ui-notification'])

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    })

    .config(function (blockUIConfig) {
        // Change the default overlay message
        blockUIConfig.message = 'Chargement en cours';

        // Change the default delay to 100ms before the blocking is visible
        // blockUIConfig.delay = 100;
    })
    .config(function (NotificationProvider) {
        NotificationProvider.setOptions({
            delay: 3000,
            startTop: 70,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'bottom',
            maxCount: 3
        });
    })
    .directive('whenScrolled', function () {
        return function (scope, elm, attr) {
            var raw = elm[0];

            elm.bind('scroll', function () {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.$apply(attr.whenScrolled);
                }
            });
        };
    });

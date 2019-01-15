angular.module('mainCtrl', [])

    .controller('MainController', function ($rootScope, $location, $window, Auth, User,$timeout,Notification) {

        let vm = this;
        vm.falseSubmitNb = 0;

        vm.loggedIn = Auth.isLoggedIn;
        vm.isAdmin = false;
        vm.message;
        vm.succed;
        vm.submitSendPass = false;
        vm.throws = false;


        $rootScope.$on('$routeChangeStart', function () {
            Auth.isLoggedIn().then(function (res) {
                vm.loggedIn = res.data.valid;
                if (res.data.valid === false) {
                    vm.doLogout();
                }
            })
            Auth.getUser()
                .then(function (data) {
                    vm.user = data.data;
                    vm.isAdmin = data.data.admin;
                });
        });


        //pour gerer l'affichage des notifications
        vm.showMessage = function () {
            return vm.throws;
        }

        vm.stopMessage = function () {
            vm.throws = false;
        }

        vm.doLogin = function () {
            vm.processing = true;
            vm.error = '';
            if (vm.falseSubmitNb < 3) {
                User.checkEmail(vm.loginData).success(function (res) {
                    let response = res;
                    let charInterdits = ["\"", " "];
                    let majuscules = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                    let majCheck = false;

                    if(Auth.checkInput(vm.loginData.password) || Auth.checkInput(vm.loginData.username)){
                        vm.error="Email ou mot de passe incorrecte !";
                        Notification.error(vm.error);
                        vm.falseSubmitNb++;
                        return;
                    }

                    if (vm.loginData.username != "agrevid@gmail.com") {
                        if (!response.checked) {
                            vm.error="Email ou mot de passe incorrecte !";
                            Notification.error(vm.error);
                            vm.falseSubmitNb++;
                            return;
                        }


                        if (vm.loginData.password.length < 8) {
                            // $window.alert("Mot de passe incorrecte !");
                            vm.error="Email ou mot de passe incorrecte !";
                            Notification.error(vm.error);
                            vm.falseSubmitNb++;
                            return;
                        }
                    }

                    for (let i = 0; i < charInterdits.length; i++) {
                        if (vm.loginData.password.includes(charInterdits[i])) {
                            if (charInterdits[i] == " ") {
                                vm.error="Email ou mot de passe incorrecte !";
                                Notification.error(vm.error);
                                vm.falseSubmitNb++;
                                return;
                            }

                            vm.error="Email ou mot de passe incorrecte !";
                            Notification.error(vm.error);
                            vm.falseSubmitNb++;
                            return;
                        }
                    }
                    if (vm.loginData.username != "agrevid@gmail.com") {
                        for (let j = 0; j < majuscules.length; j++) {
                            if (vm.loginData.password.includes(majuscules[j])) {
                                majCheck = true;
                            }
                        }
                    } else {
                        majCheck = true;
                    }

                    if (majCheck == false) {
                        vm.error="Email ou mot de passe incorrecte !";
                        Notification.error(vm.error);
                        vm.falseSubmitNb++;
                        return;
                    }


                    Auth.login(vm.loginData.username, vm.loginData.password)
                        .success(function (data) {
                            vm.processing = false;

                            Auth.getUser()
                                .then(function (data) {
                                    vm.user = data.data;
                                });

                            if (data.success){
                                $location.path('/');
                                ('Vous êtes bien connecté !');
                            }
                            else {
                                vm.falseSubmitNb++;
                                Notification.error(data.message);
                            }
                        });

                });
            } else {
                vm.error="Vous avez atteint le nombre maximum de tentatives !";
                Notification.error(vm.error);

                // $window.alert('Vous avez atteint le nombre maximum de tentatives.');
            }
        }


        vm.doLogout = function () {
            Auth.logout(vm.user).success(function (res) {
                let response = res;

                vm.isAdmin = false;
                $window.localStorage.setItem('token', '');
                $location.path('/logout');
                vm.error="Vous êtes bien déconnecté.";
                Notification.success(vm.error);

            });

        }


        vm.userSendModifyPass = function () {

            Auth.userSendModifyPass(vm.data).success(function (res) {
                vm.message = res.message;
                vm.succed = res.succed;
                vm.submitSendPass = true;
            })
        }

        vm.succedSendEmail = function () {

            return vm.succed;
        }

        vm.submitOk = function () {
            return vm.submitSendPass;
        }


    });



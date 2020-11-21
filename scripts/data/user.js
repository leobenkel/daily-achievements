define([
    'scripts/core/navigator.js',
    'scripts/util/local-storage.js'
],
    function (navigator, storage) {
        let isConnected = function () {
            return !!getUser();
        };

        let getUser = function () {
            let user = JSON.parse(storage.get('users'));
            if (!user) {
                navigator.set('login');
                return;
            }
            return user;
        }

        let registerUser = function (data) {
            storage.set('users', JSON.stringify(data));
        };

        return {
            isConnected: isConnected,
            registerUser: registerUser,
            get: getUser
        }
    });

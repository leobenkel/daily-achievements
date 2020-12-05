define([
    'scripts/core/navigator.js',
    'scripts/util/local-storage.js'
],
    function (navigator, storage) {
        let isConnectedCache;


        let isConnected = function () {
            if (!isConnectedCache) {
                isConnectedCache = !!getUser();
            }
            return isConnectedCache;
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
            isConnectedCache = null;
        };

        return {
            isConnected: isConnected,
            registerUser: registerUser,
            get: getUser
        }
    });

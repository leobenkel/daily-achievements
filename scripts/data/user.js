define([
    'scripts/util/local-storage.js',
    'scripts/data/database.js'
],
    function (storage, db) {
        let isConnected = function () {
            return !!getUser();
        };

        let getUser = function () {
            let user = JSON.parse(storage.get('users'));
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

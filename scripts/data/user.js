define([
    'scripts/util/local-storage.js'
],
    function (storage) {
        let getCurrentUserName = function () {
            return storage.get("currentUser");
        };

        let isConnected = function () {
            return !!getCurrentUserName();
        };

        let getCurrentUser = function () {
            let users = JSON.parse(storage.get('users', '{}'));
            let currentUser = getCurrentUserName();
            let names = _.keys(users);

            let config
            if (currentUser) {
                config = users[currentUser];
            } else if (names.length > 0) {
                registerUser(names[0], users[names[0]]);
                return getCurrentUser();
            } else {
                config = {};
            }

            return config;
        }

        let registerUser = function (currentUser, data) {
            let users = JSON.parse(storage.get('users', '{}'));
            users[currentUser] = data;
            storage.set('users', JSON.stringify(users));
            storage.set('currentUser', currentUser);
        };

        return {
            isConnected: isConnected,
            registerUser: registerUser,
            getCurrentUser: getCurrentUser
        }
    });

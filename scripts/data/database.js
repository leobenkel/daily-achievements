define([
    'scripts/data/user.js',
    'scripts/util/github-api.js'
],
    function (userHandler, gh) {
        let getGHClient = function () {
            let user = userHandler.get();
            // console.log(user);
            let ghClient = gh(user.name, user.githubUsername, user.githubToken);
            return ghClient;
        }

        let save = function (table, id, data) {
            let ghClient = getGHClient();
            return ghClient.setData(table, id, data);
        };

        let load = function (table, id) {
            let ghClient = getGHClient();
            return ghClient.getData(table, id);
        }

        let loadAll = function (table) {
            let ghClient = getGHClient();
            return ghClient.getTable(table);
        }

        let init = function () {
            let ghClient = getGHClient();
            return ghClient.createDatabase();
        }

        let getDatabaseLink = function () {
            let ghClient = getGHClient();
            return ghClient.getDatabaseLink();
        }

        return {
            save: save,
            load: load,
            loadAll: loadAll,
            init: init,
            getDatabaseLink: getDatabaseLink
        };
    });
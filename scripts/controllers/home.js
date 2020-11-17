define([
    '/scripts/core/controller.js',
    '/scripts/data/database.js',
    'jquery',
    'lodash'
],
    function (controller, db, $, _) {
        return {
            render: function () {
                return controller.make("home", "Home", function () {
                    return db.init();
                }).render();
            }
        }
    });

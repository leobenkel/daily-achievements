define([
    '/scripts/core/controller.js',
    '/scripts/core/navigator.js',
    'jquery',
    'lodash'
],
    function (controller, $, _) {
        return {
            render: function () {
                return controller.make("home", "Home", function () {

                }).render();
            }
        }
    });

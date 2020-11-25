define([
    '/scripts/core/controller.js',
    '/scripts/core/navigator.js',
    '/scripts/data/database.js',
    '/scripts/data/user.js',
    'jquery',
    'lodash'
],
    function (controller, navigator, db, user, $, _) {
        let resetError = function ($form) {
            let $error = $form.find('.error');
            $error.addClass('empty');
            $error.text('');
        }

        let displayError = function ($form, message) {
            let $error = $form.find('.error');
            $error.text(message);
            $error.removeClass('empty');
        }

        let renderDatabaseLink = function () {
            let database_link = db.getDatabaseLink();
            // console.log(database_link);
            if (database_link) {
                $('.database-link').attr('href', database_link);
                $('.database-link').removeClass('is-disabled');
            }
        }

        let init = function ($form) {
            let config = user.get();

            for (k in config) {
                let v = config[k];
                let $input = $form.find(`input[name="${k}"]`);
                $input.val(v);
            }
        }

        let handleSubmit = function ($form) {
            $form.submit(function (e) {
                e.preventDefault();
                let form = $(this);
                let values = form.serializeArray();
                let name = _.find(values, { 'name': 'name' })['value'];
                let userToSave = {}
                values.forEach(function (row) {
                    let name = row['name'];
                    let value = row['value'];
                    userToSave[name] = value;
                });

                user.registerUser(userToSave);

                navigator.set('');

                return false;
            });
        };

        return {
            render: function () {
                return controller.make("login", "Login", function () {
                    let $form = $("#login-form");
                    init($form);
                    handleSubmit($form);
                    renderDatabaseLink();
                    return Promise.resolve();
                }).render();
            }
        };
    });

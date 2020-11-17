define([
    '/scripts/core/controller.js',
    '/scripts/util/local-storage.js',
    '/scripts/core/navigator.js',
    '/scripts/data/user.js',
    'jquery',
    'lodash'
],
    function (controller, storage, navigator, user, $, _) {
        let data = {};

        // postgres://username:psw@host:port/database
        let rx = /postgres:\/\/([^/:]+):([^/:@]+)@([^:@]+):([0-9]+)\/([^/]+)/g;

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

        let updateForm = function ($form, data) {
            for (k in data) {
                let v = data[k];
                let $input = $form.find(`input[name="${k}"]`);
                $input.val(v);
            }

            let get = function (k) {
                return data[k] || ' ';
            }
            let uri = `postgres://${get('User')}:${get('Password')}@${get('Host')}:${get('Port')}/${get('Database')}`;
            let $uriInput = $form.find('input[name="URI"]');
            $uriInput.val(uri);
        }

        let handleUriUpdate = function ($form) {
            let $uriInput = $form.find('input[name="URI"]');

            let parseAction = _.debounce(function () {
                resetError($form);

                let uri = $(this).val();
                if (uri != '') {
                    try {
                        rx.lastIndex = 0;
                        let arr = rx.exec(uri);

                        data = {
                            User: arr[1],
                            Password: arr[2],
                            Host: arr[3],
                            Port: arr[4],
                            Database: arr[5],
                        };
                        updateForm($form, data);
                    } catch (err) {
                        console.error(uri, err);
                        displayError($form, "Invalid URI")
                    }
                }
            }, 200);

            $uriInput.keydown(parseAction);
            $uriInput.keyup(parseAction);
            $uriInput.keypress(parseAction);
        }

        let handleInputUpdate = function ($form) {
            let $inputs = $form.find('.form-login-details input');

            let parseAction = _.debounce(function () {
                resetError($form);

                let v = $(this).val();
                let name = $(this).attr('name');
                data[name] = v;

                updateForm($form, data);
            }, 200);

            $inputs.keydown(parseAction);
            $inputs.keyup(parseAction);
            $inputs.keypress(parseAction);
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

                user.registerUser(name, userToSave);

                navigator.set('');

                return false;
            });
        };

        let init = function ($form) {
            let config = user.getCurrentUser();

            for (k in config) {
                let v = config[k];
                let $input = $form.find(`input[name="${k}"]`);
                $input.val(v);
            }
        }

        return {
            render: function () {
                return controller.make("login", "Login", function () {
                    let $form = $("#login-form");
                    init($form);
                    handleUriUpdate($form);
                    handleInputUpdate($form);
                    handleSubmit($form);
                }).render();
            }
        };
    });

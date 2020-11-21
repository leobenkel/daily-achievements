define([
    'scripts/data/database.js'
],
    function (db) {
        /*
            * name (require)
            * color_hex (default random) (require)
        */

        let tableName = "Tags"

        let save = function (data) {
            return db.save(tableName, data.name, data);
        }

        let fetchOne = function (id) {
            return db.load(tableName, id);
        }

        let fetchAll = function () {
            return db.loadAll(tableName);
        }

        let getColorHex = function () {
            // https://css-tricks.com/snippets/javascript/random-hex-color/
            let randomColor = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
            return "#" + randomColor;
        }

        let openForm = function (form) {
            form.find('input[name="color"]').val(getColorHex());
            $('body').append(form);
            form.find('input[name="name"]').focus();
        }

        let initForm = function (form, isPopup, cb) {

            let closeForm = function () {
                form.detach();
                form.find('input').val("");
            }

            if (isPopup) {
                form.addClass('popup');
                form.find('.close-btn').click(closeForm);
            }

            let resetError = function () {
                let $error = form.find('.error');
                $error.addClass('empty');
                $error.text('');
            }

            let displayError = function (message) {
                let $error = form.find('.error');
                $error.text(message);
                $error.removeClass('empty');
            }

            let handleSubmit = function ($form) {
                $form.submit(function (e) {
                    e.preventDefault();
                    let form = $(this).find('form');
                    resetError(form);
                    let values = form.serializeArray();

                    // remap payload
                    let toSave = {};
                    values.forEach(function (row) {
                        let name = row['name'];
                        let value = row['value'];
                        toSave[name] = value;
                    });

                    // check validity
                    let color = toSave['color'];
                    let validColor = /^#([0-9A-F]{3}){1,2}$/i.test(color);
                    if (!validColor) {
                        displayError('Color is invalid. Format needs to be #00ff00');
                        return false;
                    }

                    save(toSave).then(function () {
                        closeForm();
                        return Promise.resolve();
                    }).then(function () {
                        return fetchAll();
                    }).then(function (allTags) {
                        return cb(allTags);
                    });

                    return false;
                });
            }

            handleSubmit(form);
            return Promise.resolve();
        }

        return {
            save: save,
            fetchOne: fetchOne,
            fetchAll: fetchAll,
            initForm: initForm,
            openForm: openForm
        };
    });

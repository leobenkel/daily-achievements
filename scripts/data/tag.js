define([
    'scripts/data/database.js',
    'scripts/util/cache.js'
],
    function (db, cache) {
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

        let fetchAllComplete = function () {
            return fetchAll().then(function (tags) {
                let allTags = {};
                return tags.map(function (n) {
                    return function () { return fetchOne(n.name); }
                })
                    .reduce(function (prev, cur) {
                        return prev.then(cur)
                            .then(function (r) {
                                allTags[r.name] = r;
                                return Promise.resolve();
                            });
                    }, Promise.resolve())
                    .then(function () {
                        return Promise.resolve(allTags);
                    });
            });
        }

        let getColorHex = function () {
            // https://css-tricks.com/snippets/javascript/random-hex-color/
            let randomColor = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
            return "#" + randomColor;
        }

        let initColor = function (form) {
            let color = getColorHex()
            form.find('input[name="color"]').val(color);
            colorizeSample(form, color);
        }

        let openForm = function (form) {
            initColor(form);
            $('body').append(form);
            form.find('input[name="name"]').focus();
        }

        let colorizeSample = function (form, color) {
            form.find('.tag-color-sample').css('background-color', color);
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

            let isValidColor = function (color) {
                return /^#([0-9A-F]{3}){1,2}$/i.test(color);
            }

            let handleColor = function () {
                let colorInput = form.find('input[name="color"]');

                let colorUpdate = _.debounce(function () {
                    let color = $(this).val();
                    if (isValidColor(color)) {
                        colorizeSample(form, color)
                    }
                }, 200);

                colorInput.keydown(colorUpdate);
                colorInput.keyup(colorUpdate);
                colorInput.keypress(colorUpdate);

                form.find('.tag-color-sample').click(function () {
                    initColor(form);
                });
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
                    let validColor = isValidColor(color);
                    if (!validColor) {
                        displayError('Color is invalid. Format needs to be #00ff00');
                        return false;
                    }

                    save(toSave).then(function () {
                        closeForm();
                        cache.update("all-notes", `tags.${toSave.name}`, toSave);
                        return cb(cache.get("all-notes"));
                    });

                    return false;
                });
            }

            handleSubmit(form);
            handleColor(form);
            return Promise.resolve();
        }

        return {
            save: save,
            fetchOne: fetchOne,
            fetchAll: fetchAll,
            fetchAllComplete: fetchAllComplete,
            initForm: initForm,
            openForm: openForm
        };
    });

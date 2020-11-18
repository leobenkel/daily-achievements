define([
    '/scripts/core/controller.js',
    '/scripts/data/database.js',
    '/scripts/data/user.js',
    '/scripts/data/tag.js',
    '/scripts/util/date.js',
    '/scripts/ui/engine.js',
    'jquery',
    'lodash',
    `text!/scripts/templates/item_form.html`,
    `text!/scripts/templates/tag_form.html`,
],
    function (controller, db, user, tag, date, uiEngine, $, _, itemForm, tagForm) {
        let tagFormF = $(tagForm);
        tag.initForm(tagFormF, true, function (allTags) {
            initSelect($('.item-tag-select'), allTags.data)
        });

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

        let getAllTags = function () {
            return tag.fetchAll()
                .then(function (tags) {
                    return Promise.resolve(tags.data);
                });
        }

        let setupInputHidden = function (form) {
            let authorName = user.get()['name'];
            form.find('input[name="author-id"]').val(authorName);

            let today = date.today();
            form.find('input[name="date"]').val(today);

            let note_id = `${authorName}-${today}`
            form.find('input[name="note-id"]').val(note_id);

            return note_id;
        };

        let initSelect = function (tagSelect, allTags) {
            tagSelect.parent('.styled-select').find('.select-ui-extra').remove();

            tagSelect.find('option').remove();
            tagSelect.append('<option disabled selected value> -- select a Tag -- </option>');
            allTags.forEach(function (tag) {
                tagSelect.append(`<option value="${tag.name}">${tag.name}</option>`);
            });
            tagSelect.append('<option value="add-new-tag">Add new tag</option>');

            tagSelect.change(function () {
                // need to catch add tag pop up
                let value = $(this).val();
                if (value == 'add-new-tag') {
                    $('body').append(tagFormF);
                }
            });

            uiEngine.run();
        }

        let setupItemContainer = function (form, allTags, note_id) {
            let addBtn = form.find('#add-item');
            let itemContainer = form.find('#item-container');

            addBtn.click(function () {
                // Item ID
                let item_count = form.find('.add-item-block').length;
                let itemF = $(itemForm.replaceAll("ITEM_COUNT", item_count));
                itemF.find('input.item-id').val(`${note_id}-${item_count}`);

                // Tag selector
                let tagSelect = itemF.find('.item-tag-select');
                initSelect(tagSelect, allTags);

                // Delete button
                itemF.find('.delete-item-btn').click(function () {
                    itemF.remove();
                });
                itemContainer.append(itemF);

                uiEngine.run();
            });
            addBtn.click();
        };

        let handleSubmit = function ($form) {
            $form.submit(function (e) {
                e.preventDefault();
                let form = $(this);
                resetError(form);
                let values = form.serializeArray();
                console.log(values);
                let toSave = {};

                // check failed inputs
                let failedInputs = form.find('[data-required="true"]').filter(function (i, elem) {
                    let value = $(elem).val()
                    return !value || value == "";
                });
                failedInputs.each(function (i, elem) {
                    let name = $(elem).siblings('label').html();
                    displayError(form, `${name} cannot be empty`);
                });
                if (failedInputs.length != 0) {
                    return false;
                }

                // remap payload
                values.forEach(function (row) {
                    let name = row['name'];
                    let value = row['value'];
                    let names = name.split('>');
                    let anchor = toSave;
                    for (n in names) {
                        if (!(n in anchor)) {
                            anchor[n] = {}
                        }
                        anchor = anchor[n]
                    }

                    toSave[name] = value;
                });
                console.log(toSave);

                return false;
            });
        };

        return {
            render: function () {
                return controller.make("new-note", "New Note", function () {
                    let form = $('#new-note-form');
                    let note_id = setupInputHidden(form);
                    handleSubmit(form);

                    return getAllTags().then(function (allTags) {
                        setupItemContainer(form, allTags, note_id);
                        form.find('button[type="submit"]').prop('disabled', false);
                    });
                }).render();
            }
        }
    });

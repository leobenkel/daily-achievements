define([
    '/scripts/core/controller.js',
    '/scripts/core/navigator.js',
    '/scripts/data/tag.js',
    '/scripts/data/note.js',
    '/scripts/data/fetch-all.js',
    '/scripts/util/date.js',
    '/scripts/util/local-storage.js',
    '/scripts/util/cache.js',
    '/scripts/ui/engine.js',
    'jquery',
    'lodash',
    `text!/scripts/templates/item_form.html`,
    `text!/scripts/templates/tag_form.html`,
],
    function (controller, navigator, tag, note, fetchAll, date, storage, cache, uiEngine, $, _, itemForm, tagForm) {
        let tagFormF = $(tagForm);
        tag.initForm(tagFormF, true, function (allTags) {
            tagFormF.add('body').find('.item-tag-select').each(function (i, sel) {
                initSelect($(sel), allTags.data);
            })
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

        let setupInputHidden = function (form) {
            let currentDate = storage.get('edit-date', date.today());
            form.find('input[name="date"]').val(currentDate);
        };

        let initSelect = function (tagSelect, allData) {
            if (tagSelect.length == 0) {
                return;
            }
            let currentValue = tagSelect.val();
            tagSelect.parent('.styled-select').find('.select-ui-extra').remove();

            tagSelect.find('option').remove();
            tagSelect.append('<option disabled selected value> -- select a Tag -- </option>');
            _.values(allData.tags).forEach(function (tag) {
                tagSelect.append(`<option value="${tag.name}">${tag.name}</option>`);
            });
            tagSelect.append('<option value="add-new-tag">Add new tag</option>');
            tagSelect.val(currentValue);

            uiEngine.run();
        }

        let setupItemContainer = function (form, allTags) {
            let addBtn = form.find('#add-item');
            let itemContainer = form.find('#item-container');

            addBtn.click(function () {
                // Item ID
                let item_count = form.find('.add-item-block').length;
                let itemF = $(itemForm.replaceAll("ITEM_COUNT", item_count));

                // Tag selector
                let tagSelect = itemF.find('.item-tag-select');
                initSelect(tagSelect, allTags);

                let contentField = itemF.find('.item-content-input');
                tagSelect.change(function () {
                    // need to catch add tag pop up
                    let value = $(this).val();
                    if (value == 'add-new-tag') {
                        tag.openForm(tagFormF);
                        contentField.attr('placeholder', `What have you accomplished?`);
                    } else {
                        contentField.attr('placeholder', `Worked on ${value}`);
                    }
                });

                // Delete button
                itemF.find('.delete-item-btn').click(function () {
                    itemF.remove();
                });
                itemContainer.append(itemF);

                uiEngine.run();
            });
            addBtn.click();
        };

        let handleSubmit = function ($form, allData) {
            $form.submit(function (e) {
                e.preventDefault();
                let form = $(this);
                resetError(form);
                let values = form.serializeArray();
                // console.log(values);
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
                    _.set(toSave, name, value);
                });
                // console.log(toSave);

                // extract items to save
                let itemsToSave = toSave.item
                    .map(function (itm, i) {
                        if (itm['content'] == '') {
                            delete itm['content'];
                        }
                        return itm;
                    });

                let noteData = {
                    note_id: toSave['date'],
                    date: toSave['date'],
                    items: itemsToSave
                };

                // TODO: need all data for it to work
                let noteDataToSave = _.cloneDeep(noteData);
                noteDataToSave['items'] = noteData.items.map(function (item) {
                    return { tag: allData.tags[item.tag] };
                });

                note.save(noteData)
                    .then(function () {
                        cache.update("all-notes", `notes.${noteData.note_id}`, noteDataToSave);
                        navigator.set('');
                    });

                return false;
            });
        };

        return {
            render: function () {
                return controller.make("new-note", "New Note", function () {
                    let form = $('#new-note-form');
                    setupInputHidden(form);

                    return fetchAll.use(function (allData) {
                        handleSubmit(form, allData);
                        setupItemContainer(form, allData);
                        form.find('button[type="submit"]').prop('disabled', false);
                    });
                }).render();
            }
        }
    });

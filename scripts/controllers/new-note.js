define([
    '/scripts/core/controller.js',
    '/scripts/data/database.js',
    '/scripts/data/user.js',
    '/scripts/data/tag.js',
    '/scripts/util/date.js',
    'jquery',
    'lodash',
    `text!/scripts/templates/item_form.html`
],
    function (controller, db, user, tag, date, $, _, itemForm) {
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

        let setupItemContainer = function (form, allTags, note_id) {
            let addBtn = form.find('#add-item');
            let itemContainer = form.find('#item-container');

            addBtn.click(function () {
                let item_count = form.find('.add-item-block').length;
                let itemF = $(itemForm.replaceAll("ITEM_COUNT", item_count));
                itemF.find('input.item-id').val(`${note_id}-${item_count}`);

                let tagSelect = itemF.find('.item-tag-select');

                allTags.forEach(function (i, tag) {
                    tagSelect.append(`<option value="${tag.id}">${tag.name}</option>`);
                });
                tagSelect.append(`<option value="add-new-tag">Add new tag</option>`);

                let deleteBtn = itemF.find('.delete-item-btn');
                deleteBtn.click(function () {
                    itemF.remove();
                });
                itemContainer.append(itemF);
            });

            addBtn.click();
        };

        let handleSubmit = function ($form) {
            $form.submit(function (e) {
                e.preventDefault();
                let form = $(this);
                let values = form.serializeArray();
                console.log(values);
                let toSave = {};
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

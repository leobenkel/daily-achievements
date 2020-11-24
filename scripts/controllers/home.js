define([
    '/scripts/core/controller.js',
    '/scripts/data/database.js',
    '/scripts/data/note.js',
    '/scripts/data/tag.js',
    '/scripts/util/date.js',
    'jquery',
    'lodash'
],
    function (controller, db, note, tag, date, $, _) {
        let renderItem = function (item) {
            let content = item.content ? item.content : `Worked on <span class="tag-name">${item.tag.data.name}</span>`;
            return `
            <div class="item" style="background-color:${item.tag.data.color}">
                <div class="item-name">${content}</div>
            </div>
            `;
        }
        let renderItems = function (items) {
            let itemsContent = items.map(function (item) {
                return renderItem(item);
            }).join('');
            return `
            <div class="items-container">
                ${itemsContent}
            </div>
            `;
        };

        let renderNote = function (note) {
            return `<div class="note">
                <div class="date">${date.display(note.data.date)}</div>
                ${renderItems(note.data.items)}
            </div>`;
        }
        let renderPage = function (data) {
            data.forEach(function (note) {
                $('.recent_notes_container').append(renderNote(note));
            });
        }

        return {
            render: function () {
                return controller.make("home", "Home", function () {
                    return db.init().then(function () {
                        note.fetchAllComplete()
                            .then(function (allNotes) {
                                return tag.fetchAllComplete()
                                    .then(function (allTags) {
                                        let tagMap = {};
                                        allTags.forEach(function (tag) {
                                            tagMap[tag.data.name] = tag;
                                        });
                                        // console.log(tagMap);

                                        allNotes = allNotes.map(function (n) {
                                            n.data['items'] = n.data.items.map(function (item) {
                                                item['tag'] = tagMap[item['tag']];
                                                return item
                                            });
                                            return n;
                                        });
                                        // console.log(allNotes);

                                        return Promise.resolve(allNotes);
                                    })
                            })
                            .then(function (data) {
                                renderPage(data);
                            });
                    });
                }).render();
            }
        }
    });

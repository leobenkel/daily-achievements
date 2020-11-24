define([
    '/scripts/core/controller.js',
    '/scripts/data/database.js',
    '/scripts/data/note.js',
    'jquery',
    'lodash'
],
    function (controller, db, note, $, _) {
        return {
            render: function () {
                return controller.make("home", "Home", function () {
                    return db.init().then(function () {
                        note.fetchAll().then(function (notes) {
                            // TODO: only fetch recent onces.
                            console.log(notes);
                            let results = [];
                            return notes.data.map(function (n) {
                                return function () { return note.fetchOne(n.name); }
                            })
                                .reduce(function (prev, cur) {
                                    return prev.then(cur)
                                        .then(function (r) {
                                            results.push(r);
                                            return Promise.resolve();
                                        });
                                }, Promise.resolve())
                                .then(function () {
                                    console.log(results);
                                    let allItems = _.uniq(results.map(function (r) {
                                        return r.data.item_ids;
                                    })
                                        .reduce(function (prev, cur) {
                                            return prev.concat(cur);
                                        }, []));
                                    console.log(allItems);
                                })
                        });
                    });
                }).render();
            }
        }
    });

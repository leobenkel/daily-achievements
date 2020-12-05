define([
    'scripts/data/database.js',
    'scripts/util/date.js'
],
    function (db, date) {
        /*
            * note_id (PK)
            * author_id (indexed)(required)
            * date (indexed)(required)
            * items (required, need at east one to save): [{content, tag}, {}]
        */

        let tableName = "Notes"

        let save = function (data) {
            return db.save(tableName, data.note_id, data);
        }

        let fetchOne = function (id) {
            return db.load(tableName, id);
        }

        let fetchAll = function () {
            return db.loadAll(tableName);
        }

        let fetchAllComplete = function () {
            return fetchAll().then(function (notes) {
                // TODO: only fetch recent onces.
                let allNotes = [];
                return notes.data.map(function (n) {
                    return function () { return fetchOne(n.name); }
                })
                    .reduce(function (prev, cur) {
                        return prev.then(cur)
                            .then(function (r) {
                                allNotes.push(r);
                                return Promise.resolve();
                            });
                    }, Promise.resolve())
                    .then(function () {
                        return Promise.resolve(allNotes);
                    });
            });
        }

        return {
            save: save,
            fetchOne: fetchOne,
            fetchAll: fetchAll,
            fetchAllComplete: fetchAllComplete
        };
    });

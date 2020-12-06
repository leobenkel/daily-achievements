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

        let fetchAllComplete = function (specificMonth) {
            return fetchAll().then(function (notes) {
                let mappedNote = {};
                notes.forEach(function (n) {
                    mappedNote[n.name] = n;
                });

                let allNotes = _.cloneDeep(mappedNote);
                let noteToFetch = _.values(allNotes);

                if (specificMonth) {
                    noteToFetch = _.filter(noteToFetch, function (n) {
                        return date.parse(n.name).month == specificMonth;
                    });
                }

                return noteToFetch.map(function (n) {
                    return function () { return fetchOne(n.name); }
                })
                    .reduce(function (prev, cur) {
                        return prev.then(cur)
                            .then(function (r) {
                                allNotes[r.date] = _.merge(allNotes[r.date], r);
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

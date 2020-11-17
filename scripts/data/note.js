define([
    'scripts/data/database.js'
],
    function (db) {
        /*
            * note_id (PK)
            * author_id (indexed)(required)
            * date (indexed)(required)
            * item_ids (required, need at east one to save)
        */

        let tableName = "Notes"

        let save = function (data) {
            return db.save(tableName, data.id, data);
        }

        let fetchOne = function (id) {
            return db.load(tableName, id);
        }

        let fetchAll = function () {
            return db.loadAll(tableName);
        }

        return {
            save: save,
            fetchOne: fetchOne,
            fetchAll: fetchAll
        };
    });

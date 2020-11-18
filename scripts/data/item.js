define([
    'scripts/data/database.js'
],
    function (db) {
        /*
            * item_id (PK)
            * note_id (required)
            * tag_id (required)
            * content (can be empty and will display: Worked on [TAG]
        */

        let tableName = "Items"

        let save = function (data) {
            return db.save(tableName, data.item_id, data);
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

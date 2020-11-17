define([
    'scripts/data/database.js'
],
    function (db) {
        /*
            * tag_id (PK)
            * name (require)
            * color_hex (default random) (require)
        */

        let tableName = "Tags"

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

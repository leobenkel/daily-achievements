define([
    'scripts/data/note.js',
    'scripts/data/tag.js',
    'scripts/data/database.js',
    '/scripts/util/cache.js',
],
    function (note, tag, db, cache) {
        let fetchData = function (cb) {
            let allNotes;
            return db.init()
                .then(function () {
                    return note.fetchAllComplete();
                })
                .then(function (data) {
                    allNotes = data;
                    return tag.fetchAllComplete();
                })
                .then(function (allTags) {
                    let tagMap = {};
                    allTags.forEach(function (tag) {
                        tagMap[tag.data.name] = tag.data;
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
                    noteMap = {};
                    allNotes.forEach(function (note) {
                        noteMap[note.data.date] = note.data;
                    });

                    let output = {
                        notes: noteMap,
                        tags: tagMap
                    }

                    cb(output)
                    return Promise.resolve(output);
                });
        };

        return {
            use: function (cb) {
                return Promise.resolve().then(function () {
                    return cache.cache("all-notes", 1000 * 60 * 60 * 12 /* 12 hours */, fetchData, cb);
                });
            }
        }
    });
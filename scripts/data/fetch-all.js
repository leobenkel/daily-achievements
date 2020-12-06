define([
    'scripts/data/note.js',
    'scripts/data/tag.js',
    'scripts/data/database.js',
    '/scripts/util/cache.js',
    '/scripts/util/date.js'
],
    function (note, tag, db, cache, date) {
        let fetchData = function (currentCache, fetchSpecificMonth, cb) {
            let noteMap;
            return db.init()
                .then(function () {
                    return note.fetchAllComplete(fetchSpecificMonth);
                })
                .then(function (data) {
                    noteMap = data;
                    return tag.fetchAllComplete();
                })
                .then(function (tagMap) {
                    _.values(noteMap).forEach(function (n) {
                        if (n.items) {
                            _.set(noteMap, `${n.date}.items`, n.items.map(function (item) {
                                item['tag'] = tagMap[item['tag']];
                                return item
                            }));
                        }
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
                    return cache.cache("all-notes", 1000 * 60 * 60 * 48 /* 48 hours */, function (cb) {
                        return fetchData(null, cb)
                    }, cb);
                });
            },
            useMonth: function (month, cb) {
                console.log('month', month);
                return cache.smartIterativeCache(
                    "all-notes",
                    1000 * 60 * 60 * 48 /* 48 hours */,
                    function (currentCache) {
                        console.log('current cache', currentCache);
                        let allDates = _.filter(
                            _.map(
                                _.keys(currentCache.notes),
                                function (d) { return date.parse(d); }
                            ),
                            function (d) { return d.month == month; }
                        );
                        console.log('allDates', allDates);

                        let needMoreCache = false;

                        allDates.forEach(function (d) {
                            let note = currentCache.notes[d.compactFormat];
                            if (!(note['date'] && note['items'])) {
                                needMoreCache = true;
                                return false;
                            }
                        });

                        console.log('need fetch more cache', needMoreCache);
                        return needMoreCache;
                    },
                    function (currentCache, cb) {
                        return fetchData(currentCache, month, cb)
                    },
                    function (oldCache, newData) {
                        console.log('oldCache', oldCache);
                        console.log('newData', newData);

                        let output = _.merge(oldCache, newData);
                        console.log('output', output);
                        return output;
                    },
                    cb
                );
            }
        }
    });
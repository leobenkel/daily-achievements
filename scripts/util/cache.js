define([
    '/scripts/util/configuration.js',
    '/scripts/util/local-storage.js',
    'lodash'
], function (config, storage, _) {
    let getTime = function () {
        var d = new Date();
        var n = d.getTime();
        return n;
    };

    // expiration will be the delta in ms for expiration
    // ie: if expiration is 1000, the cache will expire in 1 second.
    let cache = function (name, expiration, fetchFunction, cb) {
        let r = storage.get(name);

        // cache was found
        if (r && config.cache) {
            r = JSON.parse(r);
            let time = r.tty;
            let value = r.value;

            // not expired yet
            if (getTime() < time) {
                console.log("cache-get", name, value);
                cb(value, true);
                return;
            }
        }

        fetchFunction(function (result) {
            storage.set(name, JSON.stringify({
                value: result,
                tty: getTime() + expiration
            }));
            cb(result, false);
        });
    };

    let clear = function (name) {
        storage.clear(name);
    };

    let update = function (name, keyPath, newValue) {
        let r = storage.get(name);
        if (r) {
            // cache was found
            r = JSON.parse(r);
            let time = r.tty;
            let value = r.value;
            value = _.set(value, keyPath, newValue);
            storage.set(name, JSON.stringify({
                value: value,
                tty: time
            }));
        }
    };

    let get = function (name) {
        let r = storage.get(name);
        // cache was found
        if (r && config.cache) {
            r = JSON.parse(r);
            let time = r.tty;
            let value = r.value;

            // not expired yet
            if (getTime() < time) {
                return value;
            }
        }
        return;
    }

    let smartIterativeCache = function (name, expiration, cacheNeedUpdate, fetchData, combineCache, readyToUseData) {
        let saveData = function (newData) {
            storage.set(name, JSON.stringify({
                value: newData,
                tty: getTime() + expiration
            }));
        }

        let updateData = function (currentCache) {
            return fetchData(currentCache, function (newData) {
                let completeValue = combineCache(currentCache, newData);
                saveData(completeValue);
                console.log("smart-cache-updated", name, completeValue);
                return readyToUseData(completeValue, true);
            });
        }

        let r = storage.get(name);
        // cache was found
        if (r && config.cache) {
            r = JSON.parse(r);
            let time = r.tty;
            let value = r.value;

            // not expired yet
            if (getTime() < time) {
                let needUpdate = cacheNeedUpdate(value);
                if (needUpdate) {
                    return updateData(value);
                }

                console.log("smart-cache-get", name, value);
                return readyToUseData(value, false);
            }
        }

        return updateData();
    }

    return {
        cache: cache,
        get: get,
        clear: clear,
        update: update,
        smartIterativeCache: smartIterativeCache
    }
});
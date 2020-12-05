define([], function () {
    let obfuscated = true;

    // TODO: Turn to false when release
    let debug = true;

    let encode = function (str) {
        return obfuscated ? btoa(unescape(encodeURIComponent(str))) : str;
    };

    let decode = function (str) {
        return obfuscated ? decodeURIComponent(escape(window.atob(str))) : str;
    };

    let setStorage = function (key, value) {
        window.localStorage.setItem(encode(key), encode(value));
        let obj = {}
        obj[key] = value;
        if (debug) console.log('SET', key, value);
        return obj;
    };

    let getStorage = function (key, defaultValue = null) {
        let value = window.localStorage.getItem(encode(key));
        if (value && value != "null") {
            let decodedValue = decode(value)
            if (debug) console.log('GET', key, decodedValue);
            return decodedValue;
        } else {
            if (debug) console.log('GET (default)', key, defaultValue);
            return defaultValue;
        }
    };

    let clear = function (key) {
        window.localStorage.removeItem(encode(key));
    }

    let localStorage = {
        get: getStorage,
        set: setStorage,
        clear: clear,
        clearAll: function (key) {
            window.localStorage.clear();
        }
    };

    return localStorage;
});
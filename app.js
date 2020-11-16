requirejs.config({
    enforceDefine: true,
    baseUrl: '/',
    paths: {
        jquery: [
            'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min',
        ],
        lodash: [
            'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min'
        ],
        text: [
            // https://github.com/requirejs/text
            '/scripts/lib/text'
        ],
        json: [
            // https://github.com/millermedeiros/requirejs-plugins
            '/scripts/lib/json'
        ]
    },
    shim: {
        scastie: {
            exports: 'scastie'
        }
    }
});

define(['/scripts/util/find-get-param.js'], function (findGetParameter, preConfig) {
    let disable_cache = findGetParameter('disable_cache');

    let config = {
        urlArgs: disable_cache ? "time=" + Date.now() : ''
    };

    requirejs.config(config);

    // Start loading the main app file. Put all of
    // your application logic in there.
    requirejs([
        'scripts/core/main.js',
    ]);
});
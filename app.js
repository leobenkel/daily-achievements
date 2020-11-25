requirejs.config({
    enforceDefine: true,
    baseUrl: '/',
    paths: {
        jquery: [
            '//ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min',
        ],
        lodash: [
            '//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min'
        ],
        text: [
            // https://github.com/requirejs/text
            '/scripts/lib/text'
        ],
        json: [
            // https://github.com/millermedeiros/requirejs-plugins
            '/scripts/lib/json'
        ],
        github: [
            'https://unpkg.com/github-api/dist/GitHub.bundle.min'
        ],
        calendarLib: [
            // https://github.com/mauroreisvieira/hello-week
            // '//cdn.jsdelivr.net/npm/hello-week@3.0.4-beta/dist/hello.week'
            '/scripts/lib/hello.week.3.0.4'
        ]
    },
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
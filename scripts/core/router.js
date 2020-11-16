define([
    '/scripts/core/navigator.js',
    '/scripts/data/user.js'
],
    function (navigator, user) {
        // https://verekia.com/requirejs/build-simple-client-side-mvc-app-require-js/

        let userCreateRoute = { hash: ['login'], controller: 'login' }
        let routes = [
            { hash: ['', 'home'], controller: 'home' },
            userCreateRoute,
            { hash: ['advising'], controller: 'advising' },
            { hash: ['teaching'], controller: 'teaching' },
            { hash: ['speaking'], controller: 'speaking' },
            { hash: ['contact'], controller: 'contact' },
            { hash: ['degrees'], controller: 'degrees' },
            { hash: ['thanks'], controller: 'thanks' },
            { hash: ['recommendations'], controller: 'recommendations' },
        ];

        let defaultRoute = '';
        let currentHash;

        let usingEscapedFragment = false;

        let getHash = function () {
            let r = navigator.get();
            usingEscapedFragment = r.escaped_fragment;
            return r.hash;
        }

        let loadController = function (controller, cb) {
            currentHash = controller;
            require([`/scripts/controllers/${controller.controller}.js`], function (controllerEngine) {
                currentHash = controller;
                if (navigator.isDebug) console.log(`calling controller '${controller.hash}'...`);
                controllerEngine.render();
                cb();
            });
        }

        let hashCheck = function (cb) {
            if (!user.isConnected() && currentHash != userCreateRoute) {
                navigator.set(userCreateRoute.hash[0]);
            }
            if (!currentHash || !currentHash.hash.includes(getHash())) {
                let foundRoute = false;

                for (var i = 0, currentRoute; currentRoute = routes[i++];) {
                    if (currentRoute.hash.includes(getHash())) {
                        foundRoute = true
                        loadController(currentRoute, cb);
                        return;
                    }
                }

                if (!foundRoute || !currentHash) {
                    navigator.set(defaultRoute);
                }

                cb();
                return;
            }

            cb();
            return;
        }

        let sleepTime = 75

        let loopRenderer = function () {
            hashCheck(function () {
                if (usingEscapedFragment) {
                    usingEscapedFragment = false;
                    window.history.replaceState({}, document.title, `/#!${getHash()}`);
                }
                runRenderer();
            })
        }

        let runRenderer = function () {
            setTimeout(loopRenderer, sleepTime);
        }

        let startRouting = function () {
            runRenderer();
        }

        return {
            startRouting: startRouting
        };
    });

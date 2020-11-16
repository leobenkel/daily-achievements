define([
    '/scripts/util/cache.js',
    '/scripts/data/user.js',
    'jquery'
],
    function (cache, user, $) {
        let renderPage = function (indexTemplate) {
            let template = $(indexTemplate);
            $('#mainContent').empty().append(template);
        }

        let renderSVG = function (callback) {
            let aj = $('.svg-render').map(function (i, element) {
                return $.Deferred(function (defer) {
                    let $e = $(element)
                    let svg_file = $e.data("svg");

                    cache(
                        svg_file,
                        1000 * 3600 * 24 * 7 /* 7 days */,
                        function (cb) {
                            $.ajax({
                                url: svg_file,
                                dataType: "text",
                                success: function (data) {
                                    cb(data);
                                },
                                error: function (xhr, err, errMessage) {
                                    console.error(xhr.responseText, err, errMessage);
                                    defer.reject();
                                }
                            });
                        }, function (svgFile) {
                            $e.append(svgFile);
                            defer.resolve();
                        });
                });
            });

            $.when(...aj).done(callback);
        }

        let handleConnection = function () {
            if (user.isConnected()) {
                $('#nav #connect').text("Logout");
                $('#nav #connect').attr("href", '#!logout');
            } else {
                $('#nav #connect').text("Login");
                $('#nav #connect').attr("href", '#!login');
                $('#nav #updateLogin').addClass('hidden');
            }
        }

        let resetScreen = function (name, title, cb) {
            require([`text!/scripts/templates/${name}.html`],
                function (template) {
                    renderPage(template);
                    $(".page_name").text(title);
                    $("html, body").animate({ scrollTop: 0 }, "slow");
                    handleConnection();
                    renderSVG(cb)
                },
                function (err) {
                    console.error(err);
                }
            );
        };

        let switchScreen = function (name, title, render) {
            if (title) {
                $('title').text(`Daily Achievements | ${title}`)
            } else {
                $('title').text("Daily Achievements")
            }
            return function () { resetScreen(name, title, render); };
        };

        return {
            make: function (name, title, render) {
                return {
                    render: switchScreen(name, title, render)
                };
                ;
            }
        }
    });

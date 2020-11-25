define([
    '/scripts/core/controller.js',
    '/scripts/data/database.js',
    '/scripts/data/note.js',
    '/scripts/data/tag.js',
    '/scripts/util/date.js',
    '/scripts/util/cache.js',
    'jquery',
    'lodash',
    'calendarLib'
],
    function (controller, db, note, tag, date, cache, $, _, calendarLib) {
        let el = calendarLib.el

        let makeCalendar = function (data) {
            let setupMonth = function (calendar) {
                return;
                let cal = $(calendar.selector);
                // console.log(cal);
                let days = cal.find('div.day');
                // console.log(days);
                days.each(function (i, d) {
                    let $d = $(d);
                    let day = $d.html();
                    // console.log(day);
                    let dateCurrent = date.dateToCompact(
                        calendar.getYear(),
                        calendar.getMonth(),
                        day
                    );
                    // console.log(dateCurrent);
                    let findDataForDate = _.find(data, function (d) {
                        return d.data.date == dateCurrent;
                    });
                    // console.log(findDataForDate);
                    if (findDataForDate) {
                        let items = findDataForDate.data.items;
                        let container = $(`<div class="activities-container"></div>`)
                        items.forEach(function (item) {
                            let color = item.tag.data.color;
                            console.log(color, item);
                            container.append(`<div class="activity" style="background-color:${color}"></div>`)
                        });
                        $d.html('');
                        $d.append(container);
                        $d.append(`<div class="day-number"><div class="number-background">${day}</div></div>`);
                        $d.addClass('day-with-activities');
                        calendar.setDaysHighlight(['2020-11-24']);
                    }
                });
            }

            let reactOnSelect = function (calendar) {
                let dateSelected = date.reduceDate(calendar.daysSelected[0]);

                let findDataForDate = _.find(data, function (d) {
                    return d.data.date == dateSelected;
                });

                if (findDataForDate) {
                    renderEvents([findDataForDate]);
                } else {
                    renderEvents(data);
                }
            }

            console.log('start calendar');

            // https://github.com/mauroreisvieira/hello-week
            let calendar = new calendarLib.HelloWeek({
                selector: '.calendar-container',
                langFolder: 'https://cdn.jsdelivr.net/npm/hello-week@3.0.4-beta/dist/langs/',
                format: 'YYYY-MM-DD',
                defaultDate: null,
                todayHighlight: true,
                weekStart: 1,
                monthShort: false,
                weekShort: true,
                minDate: null,
                maxDate: date.todayDashSeparated(),
                daysSelected: [date.todayDashSeparated()],
                daysHighlight: null,
                multiplePick: false,
                disableDaysOfWeek: null,
                disableDates: null,
                disablePastDays: false,
                range: false,
                locked: false,
                rtl: false,
                nav: ['◀', '▶'],
                timezoneOffset: new Date().getTimezoneOffset(),
                onLoad: function () {
                    $('.calendar-action-today').click(function () {
                        let today = date.todayDashSeparated()
                        calendar.daysSelected = [today];
                        calendar.goToDate(today);
                        reactOnSelect(calendar);
                    });

                    setupMonth(calendar);
                    reactOnSelect(calendar);
                },
                onNavigation: function () {
                    setupMonth(calendar);
                },
                onSelect: function () {
                    reactOnSelect(calendar);
                },
                beforeCreateDay: function (input) {
                    console.log(input);

                    let dateCurrent = date.reduceDate(input.date);
                    let findDataForDate = _.find(data, function (d) {
                        return d.data.date == dateCurrent;
                    });

                    console.log(findDataForDate);
                    if (findDataForDate) {
                        let day = input.day;
                        let items = findDataForDate.data.items;
                        let container = el('div', { class: 'activities-container' });
                        container.children = [];
                        items.forEach(function (item) {
                            let color = item.tag.data.color;
                            container.children.push(el('div', { class: 'activity', style: { 'background-color': color } }));
                        });

                        let dayContainer = el('div', { class: 'day-number' }, el('div', { class: 'number-background' }, day.toString()));

                        let att = input.node.attributes
                        att['class'] = att['class'].join(' ') + " day-with-activities"
                        let content = el(
                            'div',
                            att,
                            container,
                            dayContainer
                        );

                        input['node'] = content;
                    }

                    return input;
                }
            });

            return calendar;
        }

        let makeItemContent = function (item) {
            return item.content ? item.content : `Worked on <span class="tag-name" > ${item.tag.data.name}</span> `;
        }

        let renderItem = function (item) {
            let content = makeItemContent(item);
            return `
            <div class= "item" style ="background-color:${item.tag.data.color}">
                <div class="item-name">${content}</div>
            </div>
            `;
        }

        let renderItems = function (items) {
            let itemsContent = items.map(function (item) {
                return renderItem(item);
            }).join('');
            return `
            <div class="items-container">
                ${itemsContent}
            </div>
            `;
        };

        let renderNote = function (note) {
            return `<div class="note">
            <div class="date">${date.display(note.data.date)}</div>
                ${renderItems(note.data.items)}
            </div> `;
        }

        let renderEvents = function (data) {
            $('.recent_notes_container').empty();
            data.forEach(function (note) {
                $('.recent_notes_container').append(renderNote(note));
            });
        }

        let renderPage = function (data) {
            renderEvents(data);

            makeCalendar(data);
        }

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
                        tagMap[tag.data.name] = tag;
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

                    cb(allNotes)
                    return Promise.resolve(allNotes);
                });
        };

        return {
            render: function () {
                return controller.make("home", "Home", function () {
                    return Promise.resolve().then(function () {
                        return cache("all-notes", 1000 * 60 * 60 * 12 /* 12 hours */, fetchData, renderPage);
                    });
                }).render();
            }
        };
    });

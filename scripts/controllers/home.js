define([
    '/scripts/core/controller.js',
    '/scripts/core/navigator.js',
    '/scripts/data/database.js',
    '/scripts/data/note.js',
    '/scripts/data/tag.js',
    '/scripts/util/date.js',
    '/scripts/util/cache.js',
    '/scripts/data/fetch-all.js',
    '/scripts/util/local-storage.js',
    'jquery',
    'lodash',
    'calendarLib'
],
    function (controller, navigator, db, note, tag, date, cache, fetchAll, storage, $, _, calendarLib) {
        let makeCalendar = function (data) {
            let el = calendarLib.el

            let reactOnSelect = function (calendar) {
                if (calendar.daysSelected.length > 0) {
                    let dateSelected = date.parse(calendar.daysSelected[0]);

                    let findDataForDate = _.find(data, function (d) {
                        return date.parse(d.date).compactFormat == date.parse(dateSelected).compactFormat;
                    });

                    storage.set('edit-date', dateSelected.compactFormat);
                    calendar.goToDate(dateSelected.dashedFormat);

                    if (findDataForDate) {
                        renderEvents([findDataForDate]);
                    } else {
                        renderEvents([{ date: dateSelected }]);
                    }
                } else {
                    renderEvents([]);
                }
            };

            let getSelectedDate = function () {
                let savedDate = storage.get('edit-date');
                let convertedDate = date.parse(savedDate);
                console.log(savedDate);
                console.log(convertedDate);
                return savedDate ? convertedDate.dashedFormat : date.today().dashedFormat;
            }

            let goToday = function () {
                let today = date.today().dashedFormat;
                calendar.daysSelected = [today];
                calendar.goToDate(today);
                reactOnSelect(calendar);
            }

            // https://github.com/mauroreisvieira/hello-week
            let calendar = new calendarLib.HelloWeek({
                selector: '.calendar-container',
                langFolder: 'https://cdn.jsdelivr.net/npm/hello-week@3.0.4-beta/dist/langs/',
                format: 'YYYY-MM-DD',
                defaultDate: getSelectedDate(),
                todayHighlight: true,
                weekStart: 1,
                monthShort: false,
                weekShort: true,
                minDate: null,
                maxDate: date.today().dashedFormat,
                daysSelected: [getSelectedDate()],
                daysHighlight: null,
                multiplePick: false,
                disableDaysOfWeek: null,
                disableDates: null,
                disablePastDays: false,
                range: false,
                locked: false,
                rtl: false,
                nav: ['◀', '▶'],
                timezoneOffset: 0,//new Date().getTimezoneOffset(),
                onLoad: function () {
                    $('.calendar-action-today').off("click", "**");
                    $('.calendar-action-today').click(goToday);
                    $('.calendar-action-refresh').off("click", "**");
                    $('.calendar-action-refresh').click(function () {
                        cache.clear("all-notes");
                        clearEntirePage();
                        renderFullPage();
                    });

                    reactOnSelect(calendar);
                },
                onNavigation: function () {
                    calendar.daysSelected = [];
                    reactOnSelect(calendar);
                },
                onSelect: function () {
                    reactOnSelect(calendar);
                },
                beforeCreateDay: function (input) {
                    let dateCurrent = date.parse(input.date);
                    let findDataForDate = _.find(data, function (d) {
                        return date.parse(d.date).compactFormat == dateCurrent.compactFormat;
                    });

                    if (findDataForDate) {
                        let day = input.day;
                        let items = findDataForDate.items;
                        let container = el('div', { class: 'activities-container' });
                        container.children = [];
                        items.forEach(function (item) {
                            let color = item.tag.color;
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

        let renderEvents = function (inputNote) {
            let makeItemContent = function (item) {
                return item.content ? item.content : `Worked on <span class="tag-name" > ${item.tag.name}</span> `;
            }

            let renderItem = function (item) {
                let content = makeItemContent(item);
                return `
                <div class= "item" style ="background-color:${item.tag.color}">
                    <div class="item-name">${content}</div>
                </div>
                `;
            }

            let renderItems = function (items) {
                if (items) {
                    let itemsContent = items.map(function (item) {
                        return renderItem(item);
                    }).join('');
                    return `
                <div class="items-container">
                    ${itemsContent}
                </div>
                `;
                } else {
                    return '';
                }
            };

            let renderNote = function (note, single) {
                let noteBlock = $(`<div class="note">
                <div class="note-header">
                    <div class="date">${date.parse(note.date).humanFormat}</div>
                    <button class="update-note" type="button"><span class="material-icons">create</span></button>
                </div>
                ${renderItems(note.items)}
                </div> `);

                if (single) {
                    console.log('set-click', note.date);

                    let clickEdit = function (e) {
                        e.preventDefault();
                        console.log('set-click-event', note.date);

                        storage.set('edit-date', date.parse(note.date).compactFormat);
                        navigator.set('newNote');

                        return false;
                    };

                    let updateLink = $('.calendar-action-edit-date');
                    updateLink.text(`Edit ${date.parse(note.date).dashedFormat}`);
                    updateLink.off("click");
                    updateLink.click(clickEdit);

                    let updateShortBtn = noteBlock.find('.update-note');
                    updateShortBtn.off("click");
                    updateShortBtn.click(clickEdit);
                }
                return noteBlock;
            }

            $('.recent_notes_container').empty();
            let oneNote = inputNote.length == 1;
            _.values(inputNote).forEach(function (note) {
                $('.recent_notes_container').append(renderNote(note, oneNote));
            });
        }

        let renderPage = function (data) {
            renderEvents(data);
            makeCalendar(data);
        }

        let clearEntirePage = function () {
            $('.calendar-container').empty();
            $('.recent_notes_container').empty();
        }

        let renderFullPage = function () {
            return fetchAll.use(function (data) {
                renderPage(data.notes);
            });
        }

        return {
            render: function () {
                return controller.make("home", "Home", renderFullPage).render();
            }
        };
    });

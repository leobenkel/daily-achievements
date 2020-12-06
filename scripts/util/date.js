define([], function () {
    let monthTable = new Array();
    monthTable[1] = "Jan";
    monthTable[2] = "Feb";
    monthTable[3] = "Mar";
    monthTable[4] = "Apr";
    monthTable[5] = "May";
    monthTable[6] = "Jun";
    monthTable[7] = "Jul";
    monthTable[8] = "Aug";
    monthTable[9] = "Sep";
    monthTable[10] = "Oct";
    monthTable[11] = "Nov";
    monthTable[12] = "Dec";

    let dateObj = function (day, month, year) {
        let pad = function (num, size) {
            var s = "000000000" + num;
            return s.substr(s.length - size);
        }
        day = parseInt(day),
            month = parseInt(month),
            year = parseInt(year)
        let paddedMonth = pad(month, 2);
        let paddedDay = pad(day, 2);

        let compactFormat = `${year}${paddedMonth}${paddedDay}`;
        let dashedFormat = `${year}-${paddedMonth}-${paddedDay}`;
        let humanFormat = `${day} ${monthTable[month]} ${year}`;

        return {
            compactFormat: compactFormat,
            dashedFormat: dashedFormat,
            humanFormat: humanFormat,
            day: day,
            month: month,
            year: year
        };
    };

    let today = function () {
        let today = parse(new Date().toISOString().slice(0, 10));
        return today;
    };

    let parse = function (date) {
        // console.log('parseCompact', date);

        if (!date) {
            return;
        }

        if ($.isPlainObject(date)) {
            return date;
        }

        let year;
        let month;
        let day;

        if (date.includes("-")) {
            // input: YYYY-MM-DD
            year = date.slice(0, 4);
            month = date.slice(5, 7);
            day = date.slice(8, 10);
        } else {
            // input: YYYYMMDD
            year = date.slice(0, 4);
            month = date.slice(4, 6);
            day = date.slice(6, 8);
        }
        return dateObj(day, month, year);
    };

    return {
        today: today,
        parse: parse,
        make: dateObj
    };
});
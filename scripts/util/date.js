define([], function () {
    var month = new Array();
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Aug";
    month[8] = "Sep";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";

    let extractDate = function (date) {
        // https://stackoverflow.com/a/22835394/3357831
        // input: YYYYMMDD
        let year = date.slice(0, 4);
        let month = date.slice(4, 6);
        let day = date.slice(6, 8);

        return {
            year: year,
            month: month,
            day: day
        }
    }

    let convertDate = function (input) {
        // https://stackoverflow.com/a/22835394/3357831
        // input: YYYYMMDD
        let year = input.slice(0, 4);
        let month = input.slice(4, 6);
        let day = input.slice(6, 8);
        // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
        // January - 0, February - 1, etc.
        var date = new Date(year, month - 1, day);

        // https://stackoverflow.com/a/9873379/3357831
        return date;
    };



    let today = function () {
        return new Date().toISOString().slice(0, 10).replace(/-/g, '');
    }

    let display = function (date) {
        let data_date = convertDate(date);

        return data_date.getDate() + " " + month[data_date.getMonth()] + " " + data_date.getFullYear();
    }

    return {
        today: today,
        convertDate: convertDate,
        display: display
    };
});
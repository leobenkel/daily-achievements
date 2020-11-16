define([], function () {
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

    return convertDate;
});
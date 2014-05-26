var moment = require('moment');

module.exports = {

    renderer: function dateFilterRenderer (fieldName, callback) {
        return callback(null, '<input type="date" name="' + fieldName + '[]" class="form-control" required>');
    },

    filter: function dateFilterFilter (fieldName, form, callback) {

        var selectedDates = form[fieldName],
            obj = {},
            orCondition;


        if (selectedDates.length <= 0) {
            return callback(new Error('Date field is empty'));
        }

        if (selectedDates.length === 1) {

            if (!moment(selectedDates[0], 'YYYY-MM-DD').isValid()) {
                return callback(new Error('One of the dates is invalid'));
            }

            // there is only of of this field supplied, that means this is an AND filtering
            obj[fieldName] = { $gte: moment(selectedDates[0], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(selectedDates[0], 'YYYY-MM-DD').endOf('day').toDate() };

            return callback(null, obj);

        }

        // there are multiple filters of the same field, that means this is an OR filtering

        obj[fieldName] = [];

        for (var i in selectedDates) {

            if (!moment(selectedDates[i], 'YYYY-MM-DD').isValid()) {
                return callback(new Error('One of the dates is invalid'));
            }

            obj[fieldName].push({ $gte: moment(selectedDates[i], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(selectedDates[i], 'YYYY-MM-DD').endOf('day').toDate() } );
        }

        return callback(null, obj);

    },

    bind: function dateFilterBinder (fieldName, form, callback) {

        var html = [];

        form[fieldName].forEach(function (val) {
            html.push('<input type="date" name="' + fieldName + '[]" class="form-control" value="' + val + '" required>');
        });

        return callback(null, html);

    }

};

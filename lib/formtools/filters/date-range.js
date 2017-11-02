var moment = require('moment');

module.exports = {
    renderer: function dateRangeFilterRenderer (fieldName, callback) {
        return callback(null, '<template><span><input type="date" name="' + fieldName + '[dateFrom][]" class="form-control" style="width:50%;" data-ui-datepicker="true" required></span><span><input type="date" name="' + fieldName + '[dateTo][]" class="form-control" style="width:50%;" data-ui-datepicker="true" required></span></template>');
    },

    filter: function dateRangeFilterFilter (fieldName, form, callback) {

        if (!form[fieldName].dateFrom || !form[fieldName].dateTo || form[fieldName].dateFrom.length <= 0 || form[fieldName].dateTo <= 0) {
            return callback(new Error('One of the date fields is empty'));
        }

        var selectedDatesFrom = form[fieldName].dateFrom,
            selectedDatesTo = form[fieldName].dateTo,
            obj = {},
            orCondition;

        if (selectedDatesFrom.length !== selectedDatesTo.length) {
            return callback(new Error('One of the date fields is empty'));
        }

        if (selectedDatesFrom.length === 1) {

            if (!moment(selectedDatesFrom[0], 'YYYY-MM-DD').isValid() || !moment(selectedDatesTo[0], 'YYYY-MM-DD').isValid()) {
                return callback(new Error('One of the dates is invalid'));
            }

            // there is only of of this field supplied, that means this is an AND filtering
            obj[fieldName] = { $gte: moment(selectedDatesFrom[0], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(selectedDatesTo[0], 'YYYY-MM-DD').endOf('day').toDate() };

            return callback(null, obj);

        }

        // there are multiple filters of the same field, that means this is an OR filtering

        obj[fieldName] = [];

        for (var i in selectedDatesFrom) {

            if (!moment(selectedDatesFrom[i], 'YYYY-MM-DD').isValid() || !moment(selectedDatesTo[i], 'YYYY-MM-DD').isValid()) {
                return callback(new Error('One of the dates is invalid'));
            }

            obj[fieldName].push({ $gte: moment(selectedDatesFrom[i], 'YYYY-MM-DD').startOf('day').toDate(), $lte: moment(selectedDatesTo[i], 'YYYY-MM-DD').endOf('day').toDate() });

        }

        return callback(null, obj);

    },

    bind: function dateRangeFilterBinder (fieldName, form, callback) {

        var html = [],
            dateFrom,
            dateTo;

        for (var i = 0; i < form[fieldName].dateFrom.length; i++) {

            dateFrom = (form[fieldName].dateFrom[i]) ? form[fieldName].dateFrom[i] : '';
            dateTo = (form[fieldName].dateTo[i]) ? form[fieldName].dateTo[i] : '';

            html.push('<span><input type="date" name="' + fieldName + '[dateFrom][]" class="form-control" style="width:50%;" value="' + dateFrom + '" data-ui-datepicker="true" required></span><span><input type="date" name="' + fieldName + '[dateTo][]" class="form-control" style="width:50%;" value="' + dateTo + '" data-ui-datepicker="true" required></span>');

        }

        return callback(null, html);
    }

};

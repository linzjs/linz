'use strict';

const moment = require('moment');
const { dateRangeQuery } = require('../../api/query');
const { isoString } = require('../../api/date');

module.exports = (dateFormat = 'YYYY-MM-DD') => ({

    renderer: function dateRangeFilterRenderer (fieldName, callback) {
        return callback(null, '<template><input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="' + dateFormat + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="' + dateFormat + '" required></template>');
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

            if (!moment(selectedDatesFrom[0], dateFormat).isValid() || !moment(selectedDatesTo[0], dateFormat).isValid()) {
                return callback(new Error('One of the dates is invalid'));
            }

            // there is only of of this field supplied, that means this is an AND filtering
            obj[fieldName] = dateRangeQuery(selectedDatesFrom[0], selectedDatesTo[0], dateFormat, form.linzTimezoneOffset);

            return callback(null, obj);

        }

        // there are multiple filters of the same field, that means this is an OR filtering

        obj[fieldName] = [];

        for (var i in selectedDatesFrom) {

            if (!moment(selectedDatesFrom[i], dateFormat).isValid() || !moment(selectedDatesTo[i], dateFormat).isValid()) {
                return callback(new Error('One of the dates is invalid'));
            }

            obj[fieldName].push(dateRangeQuery(selectedDatesFrom[i], selectedDatesTo[i], dateFormat, form.linzTimezoneOffset));

        }

        return callback(null, obj);

    },

    bind: function dateRangeFilterBinder (fieldName, form, callback) {

        const html = [];
        let dateFrom;
        let dateTo;

        for (var i = 0; i < form[fieldName].dateFrom.length; i++) {

            dateFrom = (form[fieldName].dateFrom[i]) ? form[fieldName].dateFrom[i] : '';
            dateTo = (form[fieldName].dateTo[i]) ? form[fieldName].dateTo[i] : '';

            const dateFromIso = isoString(dateFrom, dateFormat, form.linzTimezoneOffset, (date) => date.startOf('day'));
            const dateToIso = isoString(dateTo, dateFormat, form.linzTimezoneOffset, (date) => date.endOf('day'));

            html.push('<input type="text" name="' + fieldName + '[dateFrom][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="' + dateFormat + '" data-linz-date-value="' + dateFromIso + '" required><input type="text" name="' + fieldName + '[dateTo][]" class="form-control" data-ui-datepicker="true" data-linz-date-format="' + dateFormat + '" data-linz-date-value="' + dateToIso + '" required>');

        }

        return callback(null, html);
    }

});

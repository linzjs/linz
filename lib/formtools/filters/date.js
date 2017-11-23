'use strict';

const moment = require('moment');
const { dateRangeQuery } = require('../../api/query');
const { isoString } = require('../../api/date');

module.exports = (dateFormat = 'YYYY-MM-DD') => ({
    
        renderer: function dateFilterRenderer (fieldName, callback) {
            return callback(null, '<template><input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="' + dateFormat + '" required></template>');
        },
    
        filter: function dateFilterFilter (fieldName, form, callback) {
    
            var selectedDates = form[fieldName],
                obj = {},
                orCondition;
    
    
            if (selectedDates.length <= 0) {
                return callback(new Error('Date field is empty'));
            }
    
            if (selectedDates.length === 1) {
    
                if (!moment(selectedDates[0], dateFormat).isValid()) {
                    return callback(new Error('One of the dates is invalid'));
                }

                // there is only of of this field supplied, that means this is an AND filtering
                obj[fieldName] = dateRangeQuery(selectedDates[0], selectedDates[0], dateFormat, form.linzTimezoneOffset);
    
                return callback(null, obj);
    
            }
    
            // there are multiple filters of the same field, that means this is an OR filtering
    
            obj[fieldName] = [];
    
            for (var i in selectedDates) {
    
                if (!moment(selectedDates[i], dateFormat).isValid()) {
                    return callback(new Error('One of the dates is invalid'));
                }

                obj[fieldName].push(dateRangeQuery(selectedDates[i], selectedDates[i], dateFormat, form.linzTimezoneOffset));

            }
    
            return callback(null, obj);
    
        },
    
        bind: function dateFilterBinder (fieldName, form, callback) {
    
            const html = [];
    
            form[fieldName].forEach(function (dateString) {

                const value = isoString(dateString, dateFormat, form.linzTimezoneOffset, (date) => date.startOf('day'));

                html.push('<input type="text" name="' + fieldName + '[]" class="form-control" data-ui-datepicker="true" data-linz-date-format="' + dateFormat + '" data-linz-date-value="' + value + '" required>');

            });
    
            return callback(null, html);
    
        }
    
    });

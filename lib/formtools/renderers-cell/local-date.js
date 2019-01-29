'use strict';

const linz = require('../../../');

const localDate = function localDateRenderer (date, record, fieldName, model, callback) {

    if (date instanceof Date) {

        return callback(null, '<time data-linz-local-date data-linz-date-format="' + linz.get('date format') + '" data-linz-utc-date="' + date.toISOString() + '"></time>');

    }

    return callback(null);

};

module.exports = localDate;

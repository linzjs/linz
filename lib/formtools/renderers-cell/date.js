'use strict';

const moment = require('moment');
const linz = require('../../../');

const date = function dateRenderer(date, record, fieldName, model, callback) {
    return callback(null, moment(date).format(linz.get('date format')));
};

module.exports = date;

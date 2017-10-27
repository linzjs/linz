'use strict';

const moment = require('moment');
const linz = require('../../../');

const datetime = function datetimeRenderer (date, record, fieldName, model, callback) {

    return callback(null, moment(date).format(linz.get('datetime format')));

};

module.exports = datetime;

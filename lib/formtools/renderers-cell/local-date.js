'use strict';

const linz = require('../../../');

const localDate = function localDateRenderer (date, record, fieldName, model, callback) {

    linz.api.renderers.dateRenderer(date)
        .then(result => callback(null, `<time data-linz-local-date data-linz-date-format="${linz.get('date format')}" data-linz-utc-date="${result}"></time>`))
        .catch(callback);

};

module.exports = localDate;

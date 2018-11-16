'use strict';

const linz = require('../../../');

const date = function dateRenderer (date, record, fieldName, model, callback) {

    linz.api.renderers.dateRenderer(date, { format: linz.get('date format') })
        .then(result => callback(null, result))
        .catch(callback);

};

module.exports = date;

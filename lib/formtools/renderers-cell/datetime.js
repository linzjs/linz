'use strict';

const linz = require('../../../');

const datetime = function datetimeRenderer (date, record, fieldName, model, callback) {

    linz.api.renderers.dateRenderer(date, { format: linz.get('datetime format') })
        .then(result => callback(null, result))
        .catch(callback);

};

module.exports = datetime;

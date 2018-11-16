'use strict';

const linz = require('../../../');

const boolean = function booleanRenderer (val, record, fieldName, model, callback) {

    linz.api.renderers.booleanRenderer(val)
        .then(result => callback(null, result))
        .catch(callback);

};

module.exports = boolean;

'use strict';

const linz = require('../../../');

const array = function arrayRenderer (val, record, fieldName, model, callback) {

    linz.api.renderers.arrayRenderer(val)
        .then(result => callback(null, result))
        .catch(callback);

};

module.exports = array;

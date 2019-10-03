'use strict';

const utils = require('../../utils');

const boolean = function booleanRenderer(
    val,
    record,
    fieldName,
    model,
    callback
) {
    return callback(null, utils.asBoolean(val) ? 'Yes' : 'No');
};

module.exports = boolean;

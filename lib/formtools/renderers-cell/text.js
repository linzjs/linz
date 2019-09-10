'use strict';

const linz = require('../../../');

const text = function textRenderer (val, record, fieldName, model, callback) {

    return callback(null, linz.api.util.escape(val));

};

module.exports = text;

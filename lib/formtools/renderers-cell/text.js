'use strict';

const text = function textRenderer (val, record, fieldName, model, callback) {

    return callback(null, val);

};

module.exports = text;

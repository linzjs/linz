'use strict';

const linz = require('../../../');

const url = function urlRenderer(val, record, fieldName, model, callback) {
    return callback(
        null,
        '<a href="' +
            linz.api.util.escape(val) +
            '" target="_blank">' +
            linz.api.util.escape(val) +
            '</a>'
    );
};

module.exports = url;

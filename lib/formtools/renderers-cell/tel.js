'use strict';

const linz = require('../../../');

const email = function emailRenderer(val, record, fieldName, model, callback) {
    return callback(
        null,
        '<a href="tel:' +
            linz.api.util.escape(val) +
            '" rel="nofollow">' +
            linz.api.util.escape(val) +
            '</a>'
    );
};

module.exports = email;

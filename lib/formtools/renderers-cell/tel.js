'use strict';

const email = function emailRenderer (val, record, fieldName, model, callback) {

    return callback(null, '<a href="tel:' + val + '" rel="nofollow">' + val + '</a>');

};

module.exports = email;

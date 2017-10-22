'use strict';

const url = function urlRenderer (val, record, fieldName, model, callback) {

    return callback(null, '<a href="' + val + '" target="_blank">' + val + '</a>');

};

module.exports = url;

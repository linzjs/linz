'use strict';

const array = function arrayRenderer (val, record, fieldName, model, callback) {

    let s = '';

    for (let i = 0; i < val.length; i++) {
        s += val[i].toString() + ((i < val.length-1) ? ', ' : '');
    }

    return callback(null, s);

};

module.exports = array;

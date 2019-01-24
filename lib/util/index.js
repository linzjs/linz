'use strict';

const {
    isArguments,
    isFunction,
    isString,
    isNumber,
    isDate,
    isRegExp,
} = require('./is');

const { getTransposeFn } = require('./form');

module.exports = {
    getTransposeFn,
    isArguments,
    isFunction,
    isString,
    isNumber,
    isDate,
    isRegExp,
};

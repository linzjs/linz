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
const { parseDataAttributes, parseScriptsAndStyles } = require('./parse');

module.exports = {
    getTransposeFn,
    isArguments,
    isFunction,
    isString,
    isNumber,
    isDate,
    isRegExp,
    parseDataAttributes,
    parseScriptsAndStyles,
};

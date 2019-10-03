'use strict';

/**
 * Check if an arguement is of a specific type.
 * https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
 * @returns {Object} Returns an object containing the functions isString etc.
 */
const functions = [
    'Arguments',
    'Function',
    'String',
    'Number',
    'Date',
    'RegExp',
].reduce((obj, name) => {
    obj[`is${name}`] = (x) => toString.call(x) == `[object ${name}]`;

    return obj;
}, {});

module.exports = functions;

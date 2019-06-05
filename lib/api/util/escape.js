'use strict';

/**
 * Given a special character, replace it with its HTML entity equivalent.
 * @param {String} char The special character to replace.
 */
const replace = (char) => {

    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return entities[char];

};

/**
 * Use this method to escape a string before using it in HTML.
 * @param {String} value The String to escape.
 * @returns {String} The escaped string.
 */
const escape = (value = '') => String(value)
    .replace(/["'&<>]/g, replace);

module.exports = { escape };

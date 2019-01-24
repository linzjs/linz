'use strict';

const { deprecate } = require('util');

/**
 * Check if a form field has a transpose function for the context.
 * @param {Object} form The form object.
 * @param {String} field The field name.
 * @param {String} context The context of the transpose function.
 * @returns {Function} The transpose function of false.
 */
const getTransposeFn = (form, field, context = 'form') => {

    if (!form) {
        throw new Error('No form was provided');
    }

    if (!field) {
        throw new Error('No field was provided');
    }

    const { transpose } = form[field];

    if (!transpose) {
        return false;
    }

    // For backwards compatibility, do not default if no context is provided.
    if (typeof transpose === 'function' && context === 'form') {
        return deprecate(transpose, 'Providing a transpose function without a context has been deprecated.');
    }

    if (transpose[context] && typeof transpose[context] === 'function') {
        return transpose[context];
    }

    return false;

};

module.exports = { getTransposeFn };

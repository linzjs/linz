'use strict';

const debug = require('debug')('linz:model');

/**
 * Clean a request body before saving to a model.
 * @param {Object} body The request body to clean.
 * @param {Object} model The model.
 * @return {Object} The cleaned request body.
 */
const clean = (body, model) => {

    if (!body) {

        debug('Body is missing');

        return {};

    }

    // Don't modify the original.
    const data = Object.assign({}, body);

    if (!model) {

        debug('Model is missing');

        return data;

    }

    // loop over the model and determine if any ref fields need to be nullified
    model.schema.eachPath((name, path) => {

        if (path.options.ref && data[name] !== undefined && !data[name].length) {
            data[name] = null;
        }

    });

    return data;

};

module.exports = { clean };

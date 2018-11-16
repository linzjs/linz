'use strict';

const linz = require('linz');

/**
 * Render a reference field as an overview link.
 * @param {Object} val The field value, this should be an ObjectId.
 * @param {Object} opts The options object.
 * @param {String} [opts.default=''] An optional default string to return.
 * @param {Object} opts.model A mongoose model object.
 * @return {Promise} Resolves with the string to display.
 */
const overviewLinkRenderer = (val, opts) => new Promise((resolve, reject) => {

    const options = Object.assign({ default: '' }, opts);

    if (!val && options.default) {
        return resolve(options.default);
    }

    if (!options.model) {
        return reject(new Error('No model was provided'));
    }

    return resolve(linz.api.url.getAdminLink(options.model, 'overview', val));

});

module.exports = overviewLinkRenderer;

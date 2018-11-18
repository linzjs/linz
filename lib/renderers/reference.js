'use strict';

const linz = require('linz');

/**
 * Render a reference field as a string.
 * @param {Object} val The field value, this should be an ObjectId.
 * @param {Object} opts The options object.
 * @param {String} [opts.default=''] An optional default string to return.
 * @param {Boolean} [opts.link=false] Optionally link to the reference record overview.
 * @param {Object} opts.model A mongoose model object.
 * @return {Promise} Resolves with the string to display.
 */
const referenceRenderer = (val, opts) => new Promise((resolve, reject) => {

    const options = Object.assign({
        default: '',
        link: true,
    }, opts);

    if (!val && options.default) {
        return resolve(options.default);
    }

    if (!options.model) {
        return reject(new Error('No model was provided'));
    }

    const Model = options.model;

    const getResult = doc => {
        return options.link ? `<a href="${linz.api.url.getAdminLink(Model, 'overview', doc._id.toString())}" title="${doc.title}">${doc.title}</a>` : doc.title;
    };

    if (Array.isArray(val)) {

        return Model.find({ _id: { $in: val } })
            .then(docs => {

                const results = {};

                docs.forEach(doc => (results[doc._id.toString()] = getResult(doc)));

                return resolve(results);

            })
            .catch(reject);

    }

    return Model.findOne(val)
        .then(doc => resolve(getResult(doc)))
        .catch(reject);

});

module.exports = referenceRenderer;

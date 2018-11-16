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

    const Model = linz.api.model.get(options.model);
    const getResult = doc => {

        console.log();
        console.log();
        console.log(options.link);
        console.log(options.link ? `<a href="${linz.api.url.getAdminLink(Model, 'overview', doc._id.toString())}" title="${doc.title}">${doc.title}</a>` : doc.title);
        console.log();
        console.log();
        console.log();

        return options.link ? `<a href="${linz.api.url.getAdminLink(Model, 'overview', doc._id.toString())}" title="${doc.title}">${doc.title}</a>` : doc.title;

    };

    if (Array.isArray(val)) {

        return Model.find({ _id: { $in: val } })
            .then(docs => resolve(docs.map(getResult).join(', ')))
            .catch(reject);

    }

    return Model.findOne(val)
        .then(doc => resolve(getResult(doc)))
        .catch(reject);

});

module.exports = referenceRenderer;

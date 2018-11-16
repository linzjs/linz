'use strict';

const linz = require('../../../');

const overviewLink = function overviewLinkRenderer (val, record, fieldName, model, callback) {

    linz.api.renderers.overviewLinkRenderer(record._id, { model })
        .then(result => callback(null, `<a href="${result}>${val}</a>`))
        .catch(callback);

	return callback(null, '');

};

module.exports = overviewLink;

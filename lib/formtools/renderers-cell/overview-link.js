'use strict';

const linz = require('../../../');

const overviewLink = function overviewLinkRenderer (val, record, fieldName, model, callback) {

	return callback(null, '<a href="' + linz.api.url.getAdminLink(model, 'overview', record._id) + '">' + val + '</a>');

};

module.exports = overviewLink;

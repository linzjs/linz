'use strict';

const array = require('./array');
const boolean = require('./boolean');
const date = require('./date');
const linz = require('../../../');
const localDate = require('./local-date');
const reference = require('./reference');
const text = require('./text');
const url = require('./url');
const utils = require('../../utils');

const defaultRenderer = function defaultRenderer (val, record, fieldName, model, callback) {

    if (val === undefined) {
        return callback(null);
    }

    if (Array.isArray(val)) {

        if (!val.length) {
            return callback(null);
        }

        // check if this field is a document array
        if (Array.isArray(model.schema.tree[fieldName])) {

            const documentArray = require('./document-array');

            return documentArray(val, record, fieldName, model, callback);

        }

        return array(val, record, fieldName, model, callback);

    }

	if (val instanceof Date) {

        if (linz.get('set local time')) {

            return localDate(val, record, fieldName, model, callback);

        }

        return date(val, record, fieldName, model, callback);

    }

    if (typeof val === 'number') {

        return text(val, record, fieldName, model, callback);

    }

    if (val !== '' && utils.isBoolean(val)) {

        return boolean(val, record, fieldName, model, callback);

    }

    // check if val is a url
    var regex = new RegExp(/^(?:mailto:|http(?:s)?:\/\/|ftp(?:s)?:\/\/)[-a-zA-Z0-9@%_\+.~#?&=]{2,256}\.[a-z]{2,}\b(\/[-a-zA-Z0-9@:%_\+.~#?&\/=]*)?$/i);

    if ( typeof val === 'string' && val.match(regex)) {

        return url(val, record, fieldName, model, callback);

    }

    // check if field is a reference document
    if (model.schema.tree[fieldName] && model.schema.tree[fieldName].ref) {

        return reference(val, record, fieldName, model, callback);

    }

	return callback(null, val);

};

module.exports = defaultRenderer;

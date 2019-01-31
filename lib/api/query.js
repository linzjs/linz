'use strict';

const linz = require('../../');
const escapeStringRegexp = require('escape-string-regexp');
const moment = require('moment');
const { isoString } = require('./date');

const field = (modelName, field, queryFor) => {

    if (!modelName) {
        throw new Error('You must pass the modelName argument');
    }

    if (!field) {
        throw new Error('You must pass the field argument');
    }

    if (!queryFor) {
        throw new Error('You must pass the queryFor argument');
    }

    const Model = linz.api.model.get(modelName);

    // Make sure we have a valid model
    if (!Model) {
        throw new Error(`The ${modelName} model could not be found`);
    }

    // Make sure we have a correct field.
    if (!Object.keys(Model.schema.paths).includes(field)) {
        throw new Error(`The ${field} field could not be found in ${modelName}`);
    }

    // Create the query
    let query = {};
    query[field] = queryFor;

    // Allow the result of `fieldRegexp` to be used as the `queryFor` argument.
    if (typeof queryFor === 'object' && Object.keys(queryFor).includes(field)) {
        query = queryFor;
    }

    return { $or: [query] };

}

const stringToRegexp = (string, flags = 'ig') => {

    let searchString = string.trim();

    // Remove non-word characters, bound by a space.
    searchString = searchString.replace(/\B[^\w\s]/g, '');

    // Replace any regexp special characters.
    searchString = escapeStringRegexp(searchString);

    // Replace multiple spaces with just one.
    searchString = searchString.replace(/\s+/g, ' ').trim();

    // Replace each space with regex OR.
    searchString = searchString.replace(/\s+/g, '|');

    return new RegExp(searchString, flags);

}

const regexp = (string, flags = 'ig') => ({ $regex: stringToRegexp(string, flags) });

const fieldRegexp = (field, string, flags = 'ig') => {

    const query = {};

    query[field] = regexp(string, flags);

    return query;

};

/**
 * Given a date range, generate a MongoDB query for range.
 * @param {String} fromDateString The from date string.
 * @param {String} toDateString   The to date string.
 * @param {String} dateFormat     The format of the date strings.
 * @param {Object} dateFormat     A MongoDB date range query.
 */
const dateRangeQuery = (fromDateString, toDateString, dateFormat, offset = '+0:00') => {

    const $gte = isoString(fromDateString, dateFormat, offset, (date) => date.startOf('day'));
    const $lte = isoString(toDateString, dateFormat, offset, (date) => date.endOf('day'));

    return { $gte, $lte };

};

module.exports = {
    dateRangeQuery,
    field,
    fieldRegexp,
    regexp,
    stringToRegexp
};

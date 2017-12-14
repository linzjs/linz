'use strict';

/**
 * Assign some defaults to the passed Mongoose query options.
 * @example
 * // returns {
 *     filter: { _id: id },
 *     lean: true,
 *     limit: 10,
 *     projection: '',
 * }
 * getOptions({ filter: { _id: id });
 * @param {Object} options Mongoose query options.
 * @param {Object} options.filter Mongo query filters.
 * @param {Boolean} options.lean Whether to return a plain JavaScript object or not.
 * @param {Number} options.limit Number of documents to return.
 * @param {String} options.projection Space delimited string containing the fields to return or '*' to return all fields.
 * @return {Object} Returns the options object for Mongoose queries.
 */
const getOptions = (options) => {

    const defaults = {
        filter: {},
        lean: true,
        limit: 10,
        projection: '_id',
    };

    Object.assign(defaults, options);

    // * must be passed to return all fields.
    if (options.projection === '*') {
        delete defaults.projection;
    }

    return defaults;

};

/**
 * Extend the build in mongoose queries.
 * @param {Object} schema The mongoose schema.
 * @param {Object} options The plugin options.
 * @return {Void} Sets up the methods.
 */
const queryPlugin = (schema, options) => {

    /**
     * Find documents from a model.
     * @example
     * Model.findDocuments({
     *     filter: { _id: id },
     *     projection: 'email username', // _id is always returned
     * });
     * @param {Object} options Mongoose query options.
     * @param {Object} options.filter Mongo query filters.
     * @param {String} options.projection Space delimited string containing the fields to return or '*' to return all fields.
     * @return {Promise} Returns a Mongoose query.
     */
    schema.statics.findDocuments = function findDocuments (options) {

        const { filter, projection } = getOptions(options);

        return this.find(filter, projection, getOptions(options));

    };

    /**
     * Find one document from a model.
     * @example
     * Model.findOneDocument({
     *     filter: { _id: id },
     *     projection: 'email username', // _id is always returned
     * });
     * @param {Object} options Mongoose query options.
     * @param {Object} options.filter Mongo query filters.
     * @param {String} options.projection Space delimited string containing the fields to return or '*' to return all fields.
     * @return {Promise} Returns a Mongoose query.
     */
    schema.statics.findOneDocument = function findOneDocument (options) {

        const { filter, projection } = getOptions(options);

        return this.findOne(filter, projection, getOptions(options));

    };

};

module.exports = { queryPlugin };

var linz = require('../../');

module.exports = function concurrencyControlPlugin (schema, options) {

    if (!options) {
        throw new Error('options is required');
    }

    if (!options.modifiedByProperty) {
        throw new Error('options.modifiedByProperty is required');
    }

    if (!options.modifiedByCellRenderer) {
        throw new Error('options.modifiedByCellRenderer is required');
    }

    // check modifiedByProperty is defined in the schema
    if (!schema.paths[options.modifiedByProperty]) {
        throw new Error ('settings.modifiedByProperty "' + options.modifiedByProperty + '" has been provided, but it is not defined in your schema.');
    }

    options.settings = options.settings || {};
    options.settings.exclusions = options.settings.exclusions || ['_id','dateCreated','dateModified'];

    // check if options.modifiedByProperty is included in the exclusions
    options.settings.exclusions.forEach(function (fieldName) {

        if (fieldName === options.modifiedByProperty) {
            throw new Error ('settings.modifiedByProperty "' + options.modifiedByProperty + '" is required and cannot be excluded.');
        }

    });

    schema.statics.getConcurrencyControlOptions = function (cb) {
        return cb(null, options);
    };

};

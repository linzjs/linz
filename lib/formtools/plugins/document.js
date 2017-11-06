var linz = require('../../../'),
    pluginHelpers = require('./plugins-helpers'),
    clone = require('clone'),
    dedupe = require('dedupe');

module.exports = function formtoolsPlugin (schema, options) {

    var types = linz.mongoose.Schema.Types,
        opts = pluginHelpers.defaults(clone(options)),
        labels = opts.labels || {},
        list, form, overview, indexes = [];

    // Must supply either a title field in the schema, or in opts.model.title.
    if (!schema.paths.title && !opts.model.title) {
        throw new Error('You must either have a title field, or the model.title key');
    }

    if (!schema.paths.title && opts.model.title && !Object.keys(schema.paths).includes(opts.model.title)) {
        throw new Error('You must reference a title field that exists in the schema');
    }

    // if title already exists, don't add a virtual for it
    if (!schema.paths.title) {

        // set a virtual for title
        schema.virtual('title').get(function () {

            // Prefer the toLabel method if provided.
            if (typeof this.toLabel === 'function') {
                return this.toLabel();
            }

            // Use the value of the title field as a last resort.
            return this[opts.model.title];

        });

    }

    // add the mandatory date created, date modified fields
    schema.add({
        dateModified: {
            type: types.Datetime,
            index: true
        },
        dateCreated: {
            type: Date,
            default: Date.now,
            index: true
        }
    });

    // Default dateModified and dateCreated labels.
    if (opts.labels) {

        opts.labels.dateModified = opts.labels.dateModified || 'Date modified';
        opts.labels.dateCreated = opts.labels.dateCreated || 'Date created';

    }

    // If label is undefined for a fieldname, default the fieldName to value of the label.
    schema.eachPath(function (fieldName) {
        if (fieldName === '_id') {
            return;
        }
        opts.labels[fieldName] = opts.labels[fieldName] || fieldName;
    });

    labels = opts.labels;

    // check if we need to render the default if list, form and overview options are provided in object DSL
    if (typeof opts.list !== 'function') {
        list = pluginHelpers.listDefaults(opts.list, labels, opts.model.title);
    }

    if (typeof opts.form !== 'function') {
        form = pluginHelpers.formSettings(schema, opts.form, labels);
    }

    if (typeof opts.overview !== 'function') {
        overview = pluginHelpers.overviewDefaults(opts.overview);
    }

    // Automatically add some indexes.
    if (list && list.sortBy) {
        indexes = list.sortBy.map(sort => sort.field);
    }

    if (list && list.filters) {
        indexes = indexes.concat(Object.keys(list.filters));
    }

    dedupe(indexes).forEach(fieldName => schema.index(pluginHelpers.indexObj(fieldName)));

    schema.pre('save', function (next, req, callback) {

        // Add the ability to by pass the pre-save hooks. Defaults to true.
        var bPreSave = !(req && req.modelPreSave === false);

        if (bPreSave) {
            this.dateModified = new Date();
        }

        return next(callback, req);

    });

    // setup a method to retrieve the labels object
    schema.statics.getLabels = function (cb) {

        if (cb) {
            return cb(null, labels);
        }

        return labels;

    };

    // setup a method to retrieve the permissions object
    schema.statics.getPermissions = function (user, cb) {

        if (typeof opts.permissions !== 'function') {
            return cb(null, opts.permissions);
        }

        return opts.permissions(user, cb);

    };

    schema.statics.addSearchFilter = function (filters, filter){

        return pluginHelpers.setFilter(filters, filter);

    };

    schema.statics.setFiltersAsQuery = function (filters) {

        return pluginHelpers.setQuery(filters);

    };

    // setup a method to retrieve the field list
    schema.statics.getList = function (user, cb) {

        // if list is defined, that means it was provided as an object DSL, let's return the formatted version
        if (list) {
            return cb(null, list);
        }

        // otherwise, the list object will be specific to user and needs to be run multiple times
        return opts.list(user, function (err, customList) {

            if (err) {
                return cb(err);
            }

            return cb(null, pluginHelpers.listDefaults(clone(customList), labels, opts.model.title));

        });

    };

    // setup a method to retrieve the form object
    schema.statics.getForm = function (user, cb) {

        // if form is defined, that means it was provided as an object DSL, let's return the formatted version
        if (form) {
            return cb(null, form);
        }

        // if we have a function, let's call it
        opts.form(user, function (err, customForm) {

            // simply return any error
            if (err) {
                return cb(err);
            }

            // apply the form settings and return the result
            return cb(null, pluginHelpers.formSettings(schema, clone(customForm), labels));

        });

    };

    // setup a method to retrieve the field list
    schema.statics.getOverview = function (user, cb) {

        // if overview is defined, that means it was provided as an object DSL, let's return the formatted version
        if (overview) {
            return cb(null, overview);
        }

        // if we have a function, let's call it
        opts.overview(user, function (err, customOverview) {

            // simply return any error
            if (err) {
                return cb(err);
            }

            // as above, apply the overview settings and return the result
            return cb(null, pluginHelpers.overviewDefaults(pluginHelpers.overviewDefaults(clone(customOverview))));

        });

    };

    // setup a method to retrieve options for the model itself
    schema.statics.getModelOptions = function (cb) {

        return cb(null, opts.model);

    };

    // defined get data function
    schema.statics.getObject = function (id, cb) {

        return this.findById(id, cb);

    };

    // defined get all data function
    // argument parameters is the same as http://mongoosejs.com/docs/api.html#model_Model.find
    schema.statics.getQuery = function (req, filters, cb) {

        // check if owner property exists? if yes filter records by owner
        if (schema.paths.owner && !filters.owner) {
            filters.owner = req.user._id;
        }

        return cb(null, this.find(filters));

    };

    // Take a Mongoose query object, and run a count against it.
    schema.statics.getCount = function (req, query, cb) {

        return cb(null, this.count(query));

    }

};

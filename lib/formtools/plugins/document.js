var linz = require('../../../'),
    pluginHelpers = require('./plugins-helpers'),
    clone = require('clone');

module.exports = function formtoolsPlugin (schema, options) {

    // if label is undefined for a fieldname, defaults to the fieldName as the label
    schema.eachPath(function (fieldName) {
        if (fieldName === '_id') {
            return;
        }
        options.labels[fieldName] = options.labels[fieldName] || fieldName;
    });

    var types = linz.mongoose.Schema.Types,
        opts = pluginHelpers.defaults(clone(options)),
        labels = opts.labels || {},
        grid, form, overview;

    // if title already exists, don't add a virtual for it
    if (!schema.paths.title) {

        // set a virtual for title
        schema.virtual('title').get(function () {

            if (typeof this.toLabel === 'function') {
                return this.toLabel();
            }

            if (schema.paths.label && this.label) {
                return this.label;
            }

            if (schema.paths.name && this.name) {
                return this.name;
            }

            if (typeof this.toString === 'function') {
                return this.toString();
            }

            return this;

        });

    }

    // add the mandatory date created, date modified fields
    schema.add({
        dateModified: {
            type: types.Datetime
        },
        dateCreated: {
            type: Date,
            default: Date.now
        }
    });

    // do we need publishing date?
    if (options.fields.usePublishingDate) {
        schema.add({
            publishDate: {
                type: types.Datetime,
                label: 'Publish date'
            }
        });
    }

    // do we need publishing status?
    if (options.fields.usePublishingStatus) {
        schema.add({
            status: {
                type: String,
                enum: ['draft', 'approved']
            }
        });
    }

    // check if we need to render the default if grid, form and overview options are provided in object DSL
    if (typeof options.grid !== 'function') {
        grid = pluginHelpers.gridDefaults(opts.grid, labels);
    }

    if (typeof options.form !== 'function') {
        form = pluginHelpers.formSettings(schema, opts.form, labels);
    }

    if (typeof options.overview !== 'function') {
        overview = pluginHelpers.overviewDefaults(opts.overview, labels, schema, opts.form);
    }

    schema.pre('save', function (next, req, callback) {

        // add ability to by pass the pre save hooks
        // defaults to true
        var bPreSave = !(req.modelPreSave === false);

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

        if (typeof options.permissions !== 'function') {
            return cb(null, opts.permissions);
        }

        return options.permissions(user, cb);

    };

    schema.statics.addSearchFilter = function (filters, filter){

        return pluginHelpers.setFilter(filters, filter);

    };

    schema.statics.setFiltersAsQuery = function (filters) {

        return pluginHelpers.setQuery(filters);

    };

    // setup a method to retrieve the column list
    schema.statics.getGrid = function (user, cb) {

        // if grid is defined, that means it was provided as an object DSL, let's return the formatted version
        if (grid) {
            return cb(null, grid);
        }

        // otherwise, the grid object will be specific to user and needs to be run multiple times
        return options.grid(user, function (err, customGrid) {

            if (err) {
                return cb(err);
            }

            return cb(null, pluginHelpers.gridDefaults(clone(customGrid), labels));

        });

    };

    // setup a method to retrieve the form object
    schema.statics.getForm = function (user, cb) {

        // if form is defined, that means it was provided as an object DSL, let's return the formatted version
        if (form) {
            return cb(null, form);
        }

        // if we have a function, let's call it
        options.form(user, function (err, customForm) {

            // simply return any error
            if (err) {
                return cb(err);
            }

            // apply the form settings and return the result
            return cb(null, pluginHelpers.formSettings(schema, clone(customForm), labels));

        });

    };

    // setup a method to retrieve the column list
    schema.statics.getOverview = function (user, cb) {

        // if overview is defined, that means it was provided as an object DSL, let's return the formatted version
        if (overview) {
            return cb(null, overview);
        }

        // if we have a function, let's call it
        options.overview(user, function (err, customOverview) {

            // simply return any error
            if (err) {
                return cb(err);
            }

            // as above, apply the overview settings and return the result
            return cb(null, pluginHelpers.overviewDefaults(pluginHelpers.overviewDefaults(clone(customOverview)), labels));

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

};

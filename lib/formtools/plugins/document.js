var linz = require('../../../'),
    pluginHelpers = require('./plugins-helpers'),
    clone = require('clone');

module.exports = function formtoolsPlugin (schema, options) {

    options = pluginHelpers.defaults(clone(options));

    var types = linz.mongoose.Schema.Types,
    labels = options.labels;

    // if title already exists, don't add a virtual for it
    if (!schema.paths.title) {

        // set a virtual for title
        schema.virtual('title').get(function () {

            if (typeof this.toLabel === 'function') return this.toLabel();
            if (schema.paths.label && this.label) return this.label;
            if (schema.paths.name && this.name) return this.name;
            if (typeof this.toString === 'function') return this.toString();

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

    schema.pre('save', function (next, req, callback) {

        // add ability to by pass the pre save hooks
        // defaults to true
        var bPreSave = !(req.modelPreSave === false);

        if (bPreSave) {
            this.dateModified = new Date();
        }

        return next(callback, req);

    });

    // setup a method to retrieve the column list
    schema.statics.getGrid = function (user, cb) {

        // if the grid is an object (i.e. not a function) just return it.
        if (typeof options.grid !== 'function') {
            // grid defaults have already been run at this stage
            // if we're dealing with an object
            return cb(null, options.grid);
        }

        // otherwise, the grid object will be specific to user and needs to be run multiple times
        return options.grid(user, function (err, grid) {

            if (err) {
                return cb(err);
            }

            // work in defaults if they don't exist
            grid = pluginHelpers.gridDefaults(clone(grid), labels);

            return cb(null, grid);

        });

    };

    // setup a method to retrieve the permissions object
    schema.statics.getPermissions = function (user, cb) {

        if (typeof options.permissions !== 'function') {
            return cb(null, options.permissions);
        }

        return options.permissions(user, cb);

    };

    // setup a method to retrieve the form object
    schema.statics.getForm = function (user, cb) {

        // if we have an object, not a form, let's apply the form settings and return the result
        if (typeof options.form !== 'function') {
            return cb(null, pluginHelpers.formSettings(schema, clone(options.form), labels));
        }

        // if we have a function, let's call it
        options.form(user, function (err, form) {

            // simply return any error
            if (err) {
                return cb(err);
            }

            // as above, apply the form settings and return the result
            return cb(null, pluginHelpers.formSettings(schema, clone(form), labels));

        });

    };

    schema.statics.addSearchFilter = function (filters, filter){

        return pluginHelpers.setFilter(filters, filter);

    };

    schema.statics.setFiltersAsQuery = function (filters) {

        return pluginHelpers.setQuery(filters);

    };

    // setup a method to retrieve the column list
    schema.statics.getOverview = function (user, cb) {

        // if we have an object, not a form, let's apply the form settings and return the result
        if (typeof options.overview !== 'function') {
            return cb(null, pluginHelpers.overviewSettings(clone(options.overview), labels));
        }

        // if we have a function, let's call it
        options.overview(user, function (err, overview) {

            // simply return any error
            if (err) {
                return cb(err);
            }

            // as above, apply the overview settings and return the result
            return cb(null, pluginHelpers.overviewSettings(pluginHelpers.overviewDefaults(clone(overview)), labels));

        });

    };

    // setup a method to retrieve options for the model itself
    schema.statics.getModelOptions = function (cb) {

        return cb(null, options.model);

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

var linz = require('../../../'),
    pluginHelpers = require('./plugins-helpers');


module.exports = function formtoolsPlugin (schema, options) {

    options = pluginHelpers.defaults(options);

    var types = linz.mongoose.Schema.Types,
    sortBy = [],
    form,
    overview;

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

    // load form settings
    form = pluginHelpers.formSettings(schema,options);

    // update sortBy from ['fieldName','secondFieldName'] to [{label:'Field name', field:'fieldName'}]
    for (var sort in options.grid.sortBy) {

        if (!options.form[options.grid.sortBy[sort]]) {
            throw new Error ('FormtoolError: options.form.' + options.grid.sortBy[sort] + ' is undefined');
        }

        sortBy.push({
            label: (options.form[options.grid.sortBy[sort]].label || options.grid.sortBy[sort]),
            field: options.grid.sortBy[sort]
        });

    }

    overview = pluginHelpers.overviewSettings(form, options.overview);

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

        if (typeof options.grid !== 'function') {
            options.grid.sortBy = sortBy;
            return cb(null, options.grid);
        }

        return options.grid(user, function (err, grid) {

            if (err) {
                return cb(err);
            }

            var opts = {
                grid: grid
            };

            // add the sortBy
            opts.grid.sortBy = sortBy;

            // work in defaults if they don't exist
            pluginHelpers.gridDefaults(opts);

            return cb(null, opts.grid);

        });

    };

    schema.statics.getForm = function(cb){

        return cb(null, form);

    };

    schema.statics.addSearchFilter = function(filters, filter){

        return pluginHelpers.setFilter(filters, filter);

    };

    schema.statics.setFiltersAsQuery = function (filters) {

        return pluginHelpers.setQuery(filters);

    };

    // setup a method to retrieve the column list
    schema.statics.getOverview = function (cb) {

        return cb(null, overview);

    };

    // is there a custom overview?
    if (options.overview) {
        schema.statics.overview = options.overview;
    }

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

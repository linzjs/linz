var pluginHelpers = require('./plugins-helpers'),
    clone = require('clone');

module.exports = function formtoolsEmbeddedDocumentPlugin (schema, options) {

    // if label is undefined for a fieldname, defaults to the fieldName as the label
    schema.eachPath(function (fieldName) {
        if (fieldName === '_id') {
            return;
        }
        options.labels[fieldName] = options.labels[fieldName] || fieldName;
    });

    var opts = pluginHelpers.defaults(clone(options), schema, true);

    // check if we need to render the default if form options are provided in object DSL
    if (typeof options.form !== 'function') {
        var form = pluginHelpers.formSettings(schema, opts.form, opts.labels);
    }

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

    // Setup a method to retrieve the form DSL.
    schema.statics.getForm = function (req, cb) {

        // if form is defined, that means it was provided as an object DSL, let's return the formatted version
        if (form) {
            return cb(null, form);
        }

        // if we have a function, let's call it
        options.form(req, function (err, customForm) {

            // simply return any error
            if (err) {
                return cb(err);
            }

            // apply the form settings and return the result
            return cb(null, pluginHelpers.formSettings(schema, clone(customForm), opts.labels));

        });

    };

    // Setup a method to retrieve the labels object.
    schema.statics.getLabels = function (cb) {

        if (cb) {
            return cb(null, opts.labels);
        }

        return opts.labels;

    };

};

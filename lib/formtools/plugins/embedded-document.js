var pluginHelpers = require('./plugins-helpers'),
    clone = require('clone');

module.exports = function formtoolsEmbeddedDocumentPlugin (schema, options) {

    var opts = pluginHelpers.defaults(clone(options), schema, true);

    // if label is undefined for a fieldname, defaults to the fieldName as the label
    schema.eachPath(function (fieldName) {
        if (fieldName === '_id') {
            return;
        }
        opts.labels[fieldName] = opts.labels[fieldName] || fieldName;
    });

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

        const formFn = () => {

            if (typeof opts.form !== 'function') {
                return opts.form;
            }

            return opts.form(req);

        };

        return pluginHelpers
                .formSettings(req, schema, clone(formFn()), opts.labels)
                .then((decoratedForm) => cb(null, decoratedForm))
                .catch(cb);

    };

    // Setup a method to retrieve the labels object.
    schema.statics.getLabels = function (cb) {

        if (cb) {
            return cb(null, opts.labels);
        }

        return opts.labels;

    };

};

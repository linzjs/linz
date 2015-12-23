var linz = require('../../../'),
    pluginHelpers = require('./plugins-helpers'),
    clone = require('clone');

module.exports = function formtoolsEmbeddedDocumentPlugin (schema, options) {

    options = pluginHelpers.defaults(options, true);

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

    schema.statics.getForm = function (user, cb) {

        // if we have an object, not a form, let's apply the form settings and return the result
        if (typeof options.form !== 'function') {
            return cb(null, pluginHelpers.formSettings(schema, clone(options.form)));
        }

        // if we have a function, let's call it
        options.form(user, function (err, form) {

            // simply return any error
            if (err) {
                return cb(err);
            }

            // as above, apply the form settings and return the result
            return cb(null, pluginHelpers.formSettings(schema, clone(form)));

        });

    };

};

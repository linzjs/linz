var linz = require('../../../'),
    pluginHelpers = require('./plugins-helpers');

module.exports = function formtoolsEmbeddedDocumentPlugin (schema, options) {

    options = pluginHelpers.defaults(options,true);

    // load form settings
    var form = pluginHelpers.formSettings(schema,options);

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

    schema.statics.getForm = function(cb){
        return cb(null, form);
    };

};

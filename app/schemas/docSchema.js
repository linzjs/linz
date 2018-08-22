'use strict';

const linz = require('../');

const docSchema = new linz.mongoose.Schema({ name: String });

docSchema.plugin(linz.formtools.plugins.embeddedDocument, {
    form: {
        name: {
            fieldset: 'Details',
            required: true,
        },
    },
});

module.exports = docSchema;

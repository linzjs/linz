'use strict';

const linz = require('../');

const emailSchema = new linz.mongoose.Schema({
    type: String,
    email: linz.mongoose.Schema.Types.Email,
});

emailSchema.plugin(linz.formtools.plugins.embeddedDocument, {
    form: {
        type: {
            fieldset: 'Details',
            required: true,
        },
        email: {
            fieldset: 'Details',
            required: true,
        }
    },
});

module.exports = emailSchema;

'use strict';

const linz = require('linz');

const docSchema = new linz.mongoose.Schema({
    name: String,
    time: Date,
});

docSchema.plugin(linz.formtools.plugins.embeddedDocument, {
    form: {
        name: {
            fieldset: 'Details',
            required: true,
        },
        time: {
            fieldset: 'Details',
            required: true,
            widget: linz.formtools.widgets.date({
                'data-linz-date-format': 'DD.MM.YY HH:mm a',
                'data-linz-date-side-by-side': 'true',
            }),
        },
    },
});

module.exports = docSchema;

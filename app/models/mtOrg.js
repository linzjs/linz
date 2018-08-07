'use strict';

const linz = require('../linz');

const mtOrgSchema = new linz.mongoose.Schema({
    name:  String,
});

// add the formtools plugin
mtOrgSchema.plugin(linz.formtools.plugins.document, {
    form: {
        name: {
            fieldset: 'Details',
        },
    },
    list: { fields: { name: true } },
    model: {
        description: 'Manage organisations.',
        label: 'Organisation',
        title: 'name',
    },
    overview: { name: true },
    permissions: {
        canCreate: false,
        canDelete: false
    },
});

module.exports = linz.mongoose.model('mtOrg', mtOrgSchema);

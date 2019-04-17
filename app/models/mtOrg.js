'use strict';

const linz = require('linz');

const mtOrgSchema = new linz.mongoose.Schema({
    createdBy: String,
    modifiedBy: String,
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
});

mtOrgSchema.pre('save', function (next, callback, req) {

    if (req.user) {
        this.modifiedBy = req.user.username;
    }

    return next(callback, req);

});

module.exports = linz.mongoose.model('mtOrg', mtOrgSchema);

'use strict';

const linz = require('linz');

const mtOrgSchema = new linz.mongoose.Schema({
    createdBy: String,
    modifiedBy: String,
    name:  String,
    email: String,
});

// add the formtools plugin
mtOrgSchema.plugin(linz.formtools.plugins.document, {
    form: {
        name: { fieldset: 'Details' },
        email: {
            fieldset: 'Details',
            helpText: 'Provide the organisation\'s primary email address.',
            widget: linz.formtools.widgets.text({
                'data-bv-remote': true,
                'data-bv-remote-message': 'Please enter a valid email address.',
                'data-bv-remote-type': 'GET',
                'data-bv-remote-url': `${linz.get('admin path')}/is-email`,
                'data-bv-remote-name': 'email',
            }),
        },
    },
    list: { fields: { name: true } },
    model: {
        description: 'Manage organisations.',
        label: 'Organisation',
        title: 'name',
    },
    overview: { name: true, email: true },
});

mtOrgSchema.pre('save', function (next, callback, req) {

    if (req && req.user) {
        this.modifiedBy = req.user.username;
    }

    return next(callback, req);

});

module.exports = linz.mongoose.model('mtOrg', mtOrgSchema);

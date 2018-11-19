'use strict';

const linz = require('linz');
const emailSchema = require('../schemas/emailSchema');

const mtUserSchema = new linz.mongoose.Schema({
    alternativeEmails: [emailSchema],
    bAdmin: {
        default: false,
        type: Boolean,
    },
    birthday: Date,
    customOffset: Date,
    email: String,
    name:  String,
    org: {
        ref: 'mtOrg',
        type: linz.mongoose.Schema.Types.ObjectId,
    },
    password: String,
    username: String,
});

// add the formtools plugin
mtUserSchema.plugin(linz.formtools.plugins.document, {
    form: {
        name: {
            fieldset: 'Details',
            helpText: 'The users full name.',
        },
        email: {
            fieldset: 'Details',
        },
        alternativeEmails: {
            fieldset: 'Details',
            helpText: 'Add some alternative emails',
            widget: linz.formtools.widgets.documents({
                setLabel: function setLabel (doc) {

                    doc.label = doc.email + ' (' + doc.type + ')';

                    return doc;

                },
            }),
        },
        org: {
            fieldset: 'Details',
        },
        birthday: {
            fieldset: 'Details',
            widget: linz.formtools.widgets.date({ 'data-linz-date-format': 'DD/MM/YYYY hh:mm a' }),
        },
        customOffset: {
            fieldset: 'Details',
            widget: linz.formtools.widgets.date({
                'data-linz-date-format': 'DD/MM/YYYY hh:mm a',
                'data-utc-offset': '-03:30',
            }),
        },
        username: {
            fieldset: 'Access',
        },
        password: {
            fieldset: 'Access',
            widget: linz.formtools.widgets.password(),
        },
        bAdmin: {
            fieldset: 'Access',
            helpText: 'This controls if the user has access to admin.',
        },
    },
    labels: {
        bAdmin: 'Has admin access?',
    },
    list: {
        fields: {
            name: true,
            username: true,
            email: true,
            bAdmin: true,
            org: { renderer: linz.formtools.cellRenderers.defaultRenderer },
        },
        recordActions: [
            {
                action: 'edit-custom',
                disabled: false,
                label: 'Customised edit form',
            },
        ],
        export: [
            {
                exclusions: '_id',
                label: 'Choose fields to export',
            },
        ],
    },
    model: {
        description: 'Manage users.',
        label: 'User',
        title: 'username',
    },
    overview: {
        summary: {
            fields: {
                name: {
                    renderer: linz.formtools.cellRenderers.defaultRenderer
                },
                email: {
                    renderer: linz.formtools.cellRenderers.defaultRenderer
                },
            },
        },
    },
});

mtUserSchema.virtual('hasAdminAccess').get(function () {
    return this.bAdmin === true;
});

mtUserSchema.methods.verifyPassword = function (candidatePassword, callback) {
    return callback(null, this.password === candidatePassword);
}

module.exports = linz.mongoose.model('mtUser', mtUserSchema);

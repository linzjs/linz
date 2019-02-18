'use strict';

const linz = require('linz');
const emailSchema = require('../schemas/emailSchema');
const moment = require('moment');

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
            transpose: {
                'export': (val) => Promise.resolve(val.map(({ email }) => email).join(',')),
            },
        },
        org: {
            fieldset: 'Details',
        },
        birthday: {
            fieldset: 'Details',
            transpose: { 'export': (val) => Promise.resolve(moment(val).format('D MMMM YYYY')) },
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
            name: { renderer: linz.formtools.cellRenderers.overviewLink },
            username: true,
            email: false,
            bAdmin: true,
            org: { renderer: linz.formtools.cellRenderers.defaultRenderer },
        },
        filters: { username: { filter: linz.formtools.filters.text } },
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
                dateFormat: 'DD MMM YYYY',
            },
        ],
    },
    model: {
        description: 'Manage users.',
        label: 'User',
        title: 'username',
    },
    overview: {
        body: [
            {
                fields: [
                    {
                        fieldName: 'name',
                        renderer: linz.formtools.cellRenderers.defaultRenderer
                    },
                    {
                        fieldName: 'email',
                        renderer: linz.formtools.cellRenderers.defaultRenderer
                    },
                ],
                label: 'Details',
            },
            [
                {
                    fields: [
                        {
                            fieldName: 'name',
                            renderer: linz.formtools.cellRenderers.defaultRenderer
                        },
                    ],
                    label: 'Section 1',
                },
                {
                    fields: [
                        {
                            fieldName: 'email',
                            renderer: linz.formtools.cellRenderers.defaultRenderer
                        },
                    ],
                    label: 'Section 2',
                },
            ],
            (req, res, record, model, cb) => cb(null, 'Custom HTML section'),
        ],
    },
});

mtUserSchema.virtual('hasAdminAccess').get(function () {
    return this.bAdmin === true;
});

mtUserSchema.methods.verifyPassword = function (candidatePassword, callback) {
    return callback(null, this.password === candidatePassword);
}

module.exports = linz.mongoose.model('mtUser', mtUserSchema);

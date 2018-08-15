'use strict';

const linz = require('../linz');

const mtUserSchema = new linz.mongoose.Schema({
    name:  String,
    email: String,
    username: String,
    password: String,
    bAdmin: {
        type: Boolean,
        default: false
    },
    org: {
        ref: 'mtOrg',
        type: linz.mongoose.Schema.Types.ObjectId,
    },
});

const customRenderer = (value, record, fieldName, model, callback) => callback(null, 'test');

// add the formtools plugin
mtUserSchema.plugin(linz.formtools.plugins.document, {
    form: {
        name: {
            fieldset: 'Details',
            helpText: 'The users full name.',
        },
        email: {
            fieldset: 'Details',
            widget: linz.formtools.widgets.email(),
        },
        org: {
            fieldset: 'Details',
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
    // Default empty object, which Linz can accept.
    permissions: function (user, callback) {

      return callback(null, {
            canCreate: false,
            canDelete: false
        });

    },
});

mtUserSchema.virtual('hasAdminAccess').get(function () {
    return this.bAdmin === true;
});

mtUserSchema.methods.verifyPassword = function (candidatePassword, callback) {
    return callback(null, this.password === candidatePassword);
}

module.exports = linz.mongoose.model('mtUser', mtUserSchema);

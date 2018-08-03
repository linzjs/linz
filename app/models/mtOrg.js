var linz = require('../linz');

var mtOrgSchema = new linz.mongoose.Schema({
    name:  String,
});

// add the formtools plugin
mtOrgSchema.plugin(linz.formtools.plugins.document, {
    form: {
        name: {
            fieldset: 'Details',
            helpText: 'The organisation name.',
        },
    },
    labels: {
            name: 'Name',
    },
    list: {
        fields: {
            name: true,
        },
    },
    model: {
        description: 'Manage organisations.',
        label: 'Organisation',
        title: 'name',
    },
    overview: {
        summary: {
            fields: {
                name: {
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

var mtOrg = module.exports = linz.mongoose.model('mtOrg', mtOrgSchema);

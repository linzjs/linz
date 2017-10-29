/* eslint-env mocha */

var expect = require('chai').expect,
    linz = require('../linz');

// init linz
linz.init({
    options: {
        'mongo': 'mongodb://localhost:27777/mongoose-formtools-test',
        'user model': 'user',
        'load models': false,
        'load configs': false
    }
});

let ApiModelSchema,
    ApiModel;

describe('Linz has a model api', function () {


    // Wait for the database
    before(function (done) {

        // Just in case the database connection takes a while
        this.timeout(10000);

        linz.once('initialised', function () {

            // Setup a test schema.
            ApiModelSchema = new linz.mongoose.Schema({
                username: String,
                password: String,
                email: String,
            });

            ApiModelSchema.methods.toLabel = function () {
                return this.username;
            };

            ApiModelSchema.virtual('hasAdminAccess').get(function () {
                return true;
            });

            // add the plugin
            ApiModelSchema.plugin(linz.formtools.plugins.document, {
                labels: {
                    username: 'Username',
                    password: 'Password',
                    email: 'Email',
                },
                list: {
                    fields: {
                        title: 'Label',
                        email: true,
                        username: true,
                    },
                    sortBy: ['username', 'email'],
                },
                form: {
                    username: {
                        fieldset: 'Fieldset'
                    },
                    password: {
                        visible: false,
                        disabled: true
                    },
                    email: {
                        fieldset: 'Fieldset',
                    }
                },
                overview: {
                    canEdit: false,
                    canDelete: false,
                    viewAll: false,
                    body: function bodyRenderer (record, callback) {
                        return callback('body content');
                    }
                },
                permissions: {
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                    canExport: false,
                    canList: false,
                    canView: false,
                    canViewRaw: false
                }
            });

            done();

        });

    });

	describe('which has a get method', function () {

        it('that should retrieve a model', function () {

            expect(linz.api.model.get('apiModel')).to.equal(ApiModel);

        });

    });

});

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
                model: {
                    title: 'username'
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

            ApiModel = linz.mongoose.model('apiModel', ApiModelSchema);

            // Set manually as we're not loading via file.
            linz.set('models', {
                apiModel: ApiModel
            });

            done();

        });

    });

	describe('which has a get method', function () {

        it('that should retrieve a model', function () {

            expect(linz.api.model.get('apiModel')).to.equal(ApiModel);

        });

    });

    describe('which has a model method', function () {

        it('that should retrieve the model options for a model', function () {

            linz.api.model.model('apiModel', function (err, opts) {

                expect(!err).to.be.true;
                expect(opts).to.eql({
                    description: '',
                    hide: false,
                    label: '',
                    plural: '',
                    title: 'username'
                });

            });

        });

    });

    describe('which has a titleField method', function () {

        it('that should retrieve the title field for a model', function () {

            linz.api.model.titleField('apiModel', 'title', function (err, field) {

                expect(!err).to.be.true;
                expect(field).to.equal('username');

            });

        });

        it('that should ignore fields that aren\'t title', function () {

            linz.api.model.titleField('apiModel', 'email', function (err, field) {

                expect(!err).to.be.true;
                expect(field).to.equal('email');

            });

        });

    });

});

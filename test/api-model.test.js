'use strict';

const linz = require('linz');

let ApiModelSchema;
let ApiModel;

// Wait for the database
beforeAll((done) => {

    // Init Linz.
    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/api-model-test',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
    });

    linz.once('initialised', () => {

        // Setup a test schema.
        ApiModelSchema = new linz.mongoose.Schema({
            username: String,
            password: String,
            email: String,
        });

        ApiModelSchema.methods.toLabel = () => this.username;

        ApiModelSchema.virtual('hasAdminAccess').get(() => true);

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

        return done();

    });

}, 10000);

afterAll((done) => linz.mongoose.connection.close(done));

describe('Linz has a model api', () => {

    describe('which has a get method', () => {

        test('that should retrieve a model', () => {

            expect(linz.api.model.get('apiModel')).toBe(ApiModel);

        });

    });

    describe('which has a model method', () => {

        test('that should retrieve the model options for a model', () => {

            linz.api.model.model('apiModel', (err, opts) => {

                expect(!err).toBe(true);
                expect(opts).toEqual({
                    description: '',
                    hide: false,
                    label: '',
                    plural: '',
                    title: 'username'
                });

            });

        });

    });

    describe('which has a titleField method', () => {

        test('that should retrieve the title field for a model', () => {

            linz.api.model.titleField('apiModel', 'title', (err, field) => {

                expect(!err).toBe(true);
                expect(field).toBe('username');

            });

        });

        test('that should ignore fields that aren\'t title', () => {

            linz.api.model.titleField('apiModel', 'email', (err, field) => {

                expect(!err).toBe(true);
                expect(field).toBe('email');

            });

        });

    });

});

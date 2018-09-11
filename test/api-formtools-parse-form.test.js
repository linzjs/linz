'use strict';

const {
    parseField,
    parseForm,
} = require('linz/lib/api/formtools/parse-form');

const linz = require('linz');

let UserModelSchema;
let UserModel;

// Wait for the database
beforeAll((done) => {

    // Init Linz.
    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/api-formtools-parse-form-test',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
    });

    linz.once('initialised', () => {

        // Setup a test schema.
        UserModelSchema = new linz.mongoose.Schema({
            username: String,
            password: String,
            email: String,
            age: Number,
        });

        UserModelSchema.methods.toLabel = () => this.username;

        UserModelSchema.virtual('hasAdminAccess').get(() => true);

        // add the plugin
        UserModelSchema.plugin(linz.formtools.plugins.document, {
            list: {
                fields: {
                    title: 'Label',
                    email: true,
                    username: true,
                },
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
                },
                age: {
                    fieldset: 'Fieldset',
                },
            },
            overview: {
                canEdit: false,
                canDelete: false,
                viewAll: false,
                body: function bodyRenderer(record, callback) {
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

        UserModel = linz.mongoose.model('user', UserModelSchema);

        // Set manually as we're not loading via file.
        linz.set('models', { userModel: UserModel });

        return done();

    });

}, 10000);

afterAll((done) => linz.mongoose.connection.close(done));

test('it parses a field to the correct value', () => {

    expect(parseField('123', 'number')).toBe(123);
    expect(parseField('2018-09-04', 'date')).toEqual(new Date('2018-09-04T00:00:00.000Z'));
    expect(parseField('false', 'boolean')).toBe(false);
    expect(parseField('trueval', 'boolean')).toBe(true);
    expect(parseField('val', 'array')).toEqual(['val']);
    expect(parseField('[{"test":"test"}]', 'documentarray')).toEqual([{ test: 'test' }]);
    expect(parseField('[{"test":"test"}]', 'unknown')).toBe('[{"test":"test"}]');

});

test('it parses a form', async () => {

    expect.assertions(2);

    await UserModel.getForm({}, async (err, modelForm) => {

        const normalForm = await parseForm(UserModel, {
            body: {
                age: '10',
            },
        }, modelForm);

        const customForm = await parseForm(UserModel, {
            body: {
                number: '10',
            },
        }, {
            number: {
                type: 'number',
            },
        });

        expect(normalForm).toEqual({ age: 10 });
        expect(customForm).toEqual({ number: 10 });

    });

});

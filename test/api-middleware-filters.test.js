'use strict';

const linz = require('linz');
const { getFilters } = require('linz/lib/api/middleware/filters');
let UserSchema;

// Wait for the database
beforeAll((done) => {

    // Init Linz.
    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/api-middleware-filters-test',
            'user model': 'user',
            'load models': false,
            'load configs': false,
        }
    });

    linz.once('initialised', () => {

        // Setup the schema
        UserSchema = new linz.mongoose.Schema({
            username: String,
            password: String,
            email: String,
        });

        UserSchema.methods.toLabel = () => this.username;

        UserSchema.virtual('hasAdminAccess').get(() => true);

        // add the plugin
        UserSchema.plugin(linz.formtools.plugins.document, {
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
                filters: {
                    title: { filter: linz.formtools.filters.text },
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
        const userModel = linz.mongoose.model('user', UserSchema);

        // Set manually as we're not loading via file.
        linz.set('models', { user: userModel });

        return done();

    });

}, 10000);

afterAll((done) => linz.mongoose.connection.close(done));

test('search filter', async () => {

    expect.assertions(1);

    const result = await getFilters({
        body: {
            '_csrf': 'jax8OKTT-kXltsUkA1GB6iouHWkeYZacoMGc',
            'filters': '{\"_csrf\":\"hohQlFpz-NlXdO1Cu5i8PV1glaQSCnylgAjI\",\"search\":\"test\",\"page\":\"1\",\"pageSize\":\"20\",\"selectedFilters\":\"\",\"sort\":\"label\"}',
            'selectedFields': '',
            'selectedIds': '',
            'submit': ''
        },
        linz: { model: linz.api.model.get('user') },
        params: { model: 'user' },
    });

    expect(result).toEqual({ "$and": [{ "$or": [{ "username": {"$regex": /test/gi } }] }] });

});

test('selectedIds filter', async () => {

    expect.assertions(1);

    const result = await getFilters({
        body: {
            '_csrf': 'jax8OKTT-kXltsUkA1GB6iouHWkeYZacoMGc',
            'filters': '{\"_csrf\":\"hohQlFpz-NlXdO1Cu5i8PV1glaQSCnylgAjI\",\"search\":\"\",\"page\":\"1\",\"pageSize\":\"20\",\"selectedFilters\":\"\",\"sort\":\"label\"}',
            'selectedFields': '',
            'selectedIds': '548faa6c68acee0100799c8e',
            'submit': ''
        },
        linz: { model: linz.api.model.get('user') },
        params: { model: 'user' },
    });

    expect(result).toEqual({ "$and": [{ "_id": { "$in": [new linz.mongoose.Types.ObjectId('548faa6c68acee0100799c8e')] } }] });

});

test('linz filters', async () => {

    expect.assertions(1);

    const result = await getFilters({
        body: {
            '_csrf': 'jax8OKTT-kXltsUkA1GB6iouHWkeYZacoMGc',
            'filters': '{\"_csrf\":\"hohQlFpz-NlXdO1Cu5i8PV1glaQSCnylgAjI\",\"search\":\"\",\"page\":\"1\",\"pageSize\":\"20\",\"selectedFilters\":\"title\",\"sort\":\"title\",\"title\":[\"123\"]}',
            'selectedFields': '',
            'selectedIds': '',
            'submit': ''
        },
        linz: { model: linz.api.model.get('user') },
        params: { model: 'user' },
    });

    expect(result).toEqual({ "$and": [{ "$or": [{ "title": { "$regex": /123/gi } }] }] });

});

test('all filters', async () => {

    expect.assertions(1);

    const result = await getFilters({
        body: {
            '_csrf': 'jax8OKTT-kXltsUkA1GB6iouHWkeYZacoMGc',
            'filters': '{\"_csrf\":\"hohQlFpz-NlXdO1Cu5i8PV1glaQSCnylgAjI\",\"search\":\"test\",\"page\":\"1\",\"pageSize\":\"20\",\"selectedFilters\":\"title\",\"sort\":\"title\",\"title\":[\"123\"]}',
            'selectedFields': '',
            'selectedIds': '548faa6c68acee0100799c8e',
            'submit': ''
        },
        linz: { model: linz.api.model.get('user') },
        params: { model: 'user' },
    });

    expect(result).toEqual({ "$and": [{ "$or": [{ "title": { "$regex": /123/gi } }] }, { "$or": [{ "username": { "$regex": /test/gi } }] }, { "_id": { "$in": [new linz.mongoose.Types.ObjectId('548faa6c68acee0100799c8e')] } }] });

});

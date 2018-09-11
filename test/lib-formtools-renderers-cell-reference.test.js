'use strict';

const linz = require('linz');
const supertest = require('supertest');

beforeAll((done) => {

    linz.init({
        options: {
            'mongo': 'mongodb://mongodb:27017/lib-formtools-renderers-cell-reference',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
    });

    linz.once('initialised', () => {

        const organisationSchema = new linz.mongoose.Schema({ name: String });

        const userSchema = new linz.mongoose.Schema({
            name: String,
            email: String,
            username: String,
            password: String,
            bAdmin: {
                type: Boolean,
                default: false
            },
            org: {
                ref: 'organisation',
                type: linz.mongoose.Schema.Types.ObjectId,
            },
        });

        organisationSchema.plugin(linz.formtools.plugins.document, {
            list: { fields: { name: true } },
            model: { title: 'name' },
            overview: { name: true },
        });

        userSchema.plugin(linz.formtools.plugins.document, {
            list: {
                fields: {
                    name: true,
                    org: { renderer: linz.formtools.cellRenderers.defaultRenderer },
                },
            },
            model: { title: 'username' },
            overview: {
                summary: {
                    fields: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        userSchema.virtual('hasAdminAccess').get(function () {
            return this.bAdmin === true;
        });

        userSchema.methods.verifyPassword = function (candidatePassword, callback) {
            return callback(null, this.password === candidatePassword);
        }

        // Set manually as we're not loading via file.
        linz.set('models', {
            organisation: linz.mongoose.model('organisation', organisationSchema),
            user: linz.mongoose.model('user', userSchema),
        });

        // Because we aren't loading the models from file, we have to initialise it ourselves.
        linz.initModels();

        return done();

    });

}, 10000);

afterAll(() => linz.mongoose.disconnect());

test('renders a link to the ref record overview', async () => {

    expect.assertions(1);

    const organisation = new linz.api.model.get('organisation')();
    const user = new linz.api.model.get('user')();

    organisation.set({ name: 'Organisation' });

    user.set({
        bAdmin: true,
        email: 'test@test.com',
        name: 'Test user',
        org: organisation._id,
        password: 'password',
        username: 'test',
    });

    const request = supertest.agent(linz.app);

    return Promise.all([
        organisation.save(),
        user.save(),
    ])
        // Login first.
        .then(() => request.post('/admin/login').send({
            password: 'password',
            username: 'test',
        }))
        // Supertest seems to use non native promises which stop Jest tests from completing.
        // Wrapping it in a Promise.resolve fixes that.
        .then(() => Promise.resolve(request.get('/admin/model/user/list')))
        .then((response) => {

            expect(response.text).toMatch(`/admin/model/organisation/${organisation._id}/overview`);

        });

});

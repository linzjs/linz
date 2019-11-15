'use strict';

const linz = require('linz');
const supertest = require('supertest');

// Wait for the database
beforeAll((done) => {

    // Init Linz.
    linz.init({
        options: {
            'csrf token': { value: 'token' },
            'mongo': 'mongodb://mongodb:27017/api-middleware-set-linz-model-test',
            'user model': 'user',
            'load models': false,
            'load configs': false
        }
    });

    linz.once('initialised', () => {

        const userSchema = new linz.mongoose.Schema({
            password: String,
            username: String,
        });

        userSchema.plugin(linz.formtools.plugins.document, { model: { title: 'username' } });

        userSchema.virtual('hasAdminAccess').get(() => true);

        userSchema.methods.verifyPassword = function (candidatePassword, callback) {
            return callback(null, this.password === candidatePassword);
        };

        // Set manually as we're not loading via file.
        linz.set('models', { user: linz.mongoose.model('user', userSchema) });

        // Because we aren't loading the models from file, we have to initialise it ourselves.
        linz.initModels();

        return done();

    });

}, 10000);

afterAll(() => linz.mongoose.disconnect());

const setupAndLogin = async () => {

    const request = supertest.agent(linz.app);
    const user = new linz.api.model.get('user')();

    user.set({
        password: 'password',
        username: 'test',
    });

    await user.save();

    const token = await request.get('/admin/login').send();

    const [csrfToken] = /(?<=name="csrf-token" content=")(.*)(?="><title>)/.exec(token.text);

    await request.post('/admin/login').send({
        _csrf: csrfToken,
        password: 'password',
        username: 'test',
    });

    return request;

};

test('it sets the linz model for built in routes', async () => {

    expect.assertions(2);

    const request = await setupAndLogin();

    const list = await request.get('/admin/model/user/list');

    expect(list.status).toBe(200);
    expect(list.text).toMatch(/<a href="\/admin\/model\/user\/.*\/overview">test<\/a>/);

});

test('it sets the linz model for custom routes', async () => {

    expect.assertions(4);

    let model;
    const request = await setupAndLogin();

    linz.app.get('/admin/model/user/export/test', (req, res) => {

        model = req.linz.model;

        return res.status(200).end();

    });

    const customRoute = await request.get('/admin/model/user/export/test');

    expect(customRoute.status).toBe(200);
    expect(model).toBeTruthy();
    expect(model.linz.formtools.labels).toBeTruthy();
    expect(model.linz.formtools.permissions).toBeTruthy();

});

test('it does not set the model if there is none in the url path', async () => {

    expect.assertions(2);

    let model;
    const request = await setupAndLogin();

    linz.app.get('/admin/notamodelpath', (req, res) => {

        model = req.linz.model;

        return res.status(200).end();

    });

    const customRoute = await request.get('/admin/notamodelpath');

    expect(customRoute.status).toBe(200);
    expect(model).toBeUndefined();

});

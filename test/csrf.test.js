'use strict';

const linz = require('linz');
const supertest = require('supertest');

beforeAll((done) => {
    linz.init({
        options: {
            'csrf token': { value: 'token' },
            'mongo': 'mongodb://mongodb:27017/csrf',
            'user model': 'user',
            'load models': false,
            'load configs': false,
        },
    });

    linz.once('initialised', () => {
        const userSchema = new linz.mongoose.Schema({
            password: String,
            username: String,
        });

        userSchema.plugin(linz.formtools.plugins.document, {
            model: { title: 'username' },
        });

        userSchema.virtual('hasAdminAccess').get(() => true);

        userSchema.methods.verifyPassword = function(
            candidatePassword,
            callback
        ) {
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

test('provides csrf protection', async () => {
    expect.assertions(2);

    const request = supertest.agent(linz.app);
    const user = new linz.api.model.get('user')();

    user.set({
        password: 'password',
        username: 'test',
    });

    await user.save();

    const response = await request.post('/admin/login').send({
        password: 'password',
        username: 'test',
    });

    expect(response.status).toBe(403);
    expect(response.text).toMatch(/ForbiddenError:\ invalid\ csrf\ token/);
});

test('allows valid requests through', async () => {
    expect.assertions(2);

    const request = supertest.agent(linz.app);
    const user = new linz.api.model.get('user')();

    user.set({
        password: 'password',
        username: 'test',
    });

    await user.save();

    const token = await request.get('/admin/login').send();

    const [
        csrfToken,
    ] = /(?<=name="csrf-token" content=")(.*)(?="><title>)/.exec(token.text);

    const response = await request.post('/admin/login').send({
        _csrf: csrfToken,
        password: 'password',
        username: 'test',
    });

    expect(response.status).toBe(302);
    expect(response.text).toMatch(/Found.\ Redirecting\ to\ \/admin/);
});

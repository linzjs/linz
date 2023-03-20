'use strict';

const linz = require('linz');
const supertest = require('supertest');

test('sets a default', () => {
    expect(linz.get('admin home')).toBe('/models/list');
    expect(linz.get('admin path')).toBe('/admin');
    expect(linz.get('admin title')).toBe('Linz');
    expect(linz.get('login path')).toBe('/admin/login');
    expect(linz.get('logout path')).toBe('/admin/logout');
    expect(linz.get('admin forgot password path')).toBe(
        '/admin/forgot-your-password'
    );
    expect(linz.get('admin password reset path')).toBe('/password-reset');
    expect(linz.get('admin password pattern')).toBe(
        '(?=(?:^.{8,}$))(?=(?:.*?[a-z]{1,}?))(?=(?:.*?[A-Z]{1,}?))(?=(?:.*?[0-9]{1,}?))(?=(?:.*?(?:\\W{1,}?|\\D{1,}?)))'
    );
    expect(linz.get('admin password pattern help text')).toBe(
        'Min. 8 characters. Must contain at least 1 uppercase letter, 1 lowercase leter, a symbol (e.g. ! ~ *) and a number.'
    );
    expect(linz.get('load models')).toBe(true);
    expect(linz.get('load configs')).toBe(true);
    expect(linz.get('configs collection name')).toBe('linzconfigs');
    expect(linz.get('username key')).toBe('username');
    expect(linz.get('password key')).toBe('password');
    expect(linz.get('error log')).toEqual(console.log);
    expect(linz.get('page size')).toBe(20);
    expect(linz.get('page sizes')).toEqual([20, 50, 100, 200]);
    expect(linz.get('cookie secret')).toBe('oST1Thr2s/iOAUgeK4yuuA==');
    expect(linz.get('date format')).toBe('ddd, ll');
    expect(linz.get('datetime format')).toBe('llll');
    expect(linz.get('set local time')).toBe(false);
    expect(typeof linz.get('permissions')).toBe('function');
    expect(linz.get('login middleware')).toHaveProperty('get');
    expect(linz.get('login middleware')).toHaveProperty('post');
    expect(linz.get('logout middleware')).toEqual({
        get: [require('linz/lib/api/middleware/logout')],
    });
    expect(linz.get('disable navigation cache')).toEqual(false);
    expect(typeof linz.get('navigationTransform')).toBe('function');
    expect(typeof linz.get('customAttributes')).toBe('function');
    expect(linz.get('mongoOptions')).toEqual({ useMongoClient: true });
    expect(linz.get('routes')).toEqual({});
    expect(linz.get('cookie options')).toEqual({
        httpOnly: true,
        path: '/',
        sameSite: true,
        signed: true,
    });
    expect(linz.get('session options')).toEqual({
        cookie: {
            httpOnly: true,
            path: '/',
            sameSite: true,
            signed: true,
        },
        saveUninitialized: false,
        secret: 'oST1Thr2s/iOAUgeK4yuuA==',
        resave: false,
    });
});

describe('once Linz is initialised', () => {
    const routeMock = jest.fn((req, res, next) => next());

    beforeAll((done) => {
        linz.init({
            options: {
                'load configs': false,
                'load models': false,
                'mongo': 'mongodb://localhost:27017/lib-defaults',
                'user model': 'user',
                'routes': {
                    get: {
                        '/model/:model/list': routeMock,
                    },
                },
            },
        });

        linz.once('initialised', () => {
            const userSchema = new linz.mongoose.Schema({
                name: String,
                email: String,
                username: String,
                password: String,
                bAdmin: {
                    type: Boolean,
                    default: false,
                },
            });

            userSchema.plugin(linz.formtools.plugins.document, {
                list: {
                    fields: {
                        name: true,
                        email: true,
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

            userSchema.virtual('hasAdminAccess').get(function() {
                return this.bAdmin === true;
            });

            userSchema.methods.verifyPassword = function(
                candidatePassword,
                callback
            ) {
                return callback(null, this.password === candidatePassword);
            };

            // Set manually as we're not loading via file.
            linz.set('models', {
                user: linz.mongoose.model('user', userSchema),
            });

            // Because we aren't loading the models from file, we have to initialise it ourselves.
            linz.initModels();

            return done();
        });
    }, 20000);

    afterAll(() => linz.mongoose.disconnect());

    test('overrides defaults', () => {
        expect(linz.get('load configs')).toBe(false);
        expect(linz.get('load models')).toBe(false);
        expect(linz.get('mongo')).toBe(
            'mongodb://localhost:27017/lib-defaults'
        );
    });

    test('executes middleware defined via routes default', async () => {
        expect.assertions(2);

        const user = new linz.api.model.get('user')();

        user.set({
            bAdmin: true,
            email: 'test@test.com',
            name: 'Test user',
            password: 'password',
            username: 'test',
        });

        const request = supertest.agent(linz.app);

        return Promise.all([user.save()])
            .then(() => request.get('/admin/login').send())
            .then((token) => {
                const [
                    csrfToken,
                ] = /(?<=name="csrf-token" content=")(.*)(?="><title>)/.exec(
                    token.text
                );

                return request.post('/admin/login').send({
                    _csrf: csrfToken,
                    password: 'password',
                    username: 'test',
                });
            })
            .then(() => Promise.resolve(request.get('/admin/models/list')))
            .then(() => {
                expect(routeMock.mock.calls.length).toBe(0);

                return Promise.resolve(request.get('/admin/model/user/list'));
            })
            .then(() => expect(routeMock.mock.calls.length).toBe(1));
    }, 20000);
});

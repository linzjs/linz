'use strict';

const linz = require('../');

test('sets a default', () => {

    expect(linz.get('admin home')).toBe('/models/list');
    expect(linz.get('admin path')).toBe('/admin');
    expect(linz.get('admin title')).toBe('Linz');
    expect(linz.get('login path')).toBe('/admin/login');
    expect(linz.get('logout path')).toBe('/admin/logout');
    expect(linz.get('admin forgot password path')).toBe('/forgot-your-password');
    expect(linz.get('admin password reset path')).toBe('/password-reset');
    expect(linz.get('admin password pattern')).toBe('(?=(?:^.{8,}$))(?=(?:.*?[a-z]{1,}?))(?=(?:.*?[A-Z]{1,}?))(?=(?:.*?[0-9]{1,}?))(?=(?:.*?(?:\\W{1,}?|\\D{1,}?)))');
    expect(linz.get('admin password pattern help text')).toBe('Min. 8 characters. Must contain at least 1 uppercase letter, 1 lowercase leter, a symbol (e.g. ! ~ *) and a number.');
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
    expect(linz.get('logout middleware')).toEqual({ get: [require('../lib/api/middleware/logout')] });
    expect(linz.get('disable navigation cache')).toEqual(false);
    expect(typeof linz.get('navigationTransform')).toBe('function');
    expect(typeof linz.get('customAttributes')).toBe('function');
    expect(linz.get('mongoOptions')).toEqual({ useMongoClient: true });

});

test('overrides defaults', (done) => {

    linz.init({
        options: {
            'admin path': '/testadmin',
            'load configs': false,
            'load models': false,
            'login path': '/logintest',
            'logout path': '/logouttest',
            'mongo': 'mongodb://mongodb:27017/defaults-test',
            'user model': 'user',
        },
    });

    linz.once('initialised', () => {

        expect(linz.get('admin path')).toBe('/testadmin');
        expect(linz.get('login path')).toBe('/logintest');
        expect(linz.get('logout path')).toBe('/logouttest');

        return done();

    });

}, 10000);

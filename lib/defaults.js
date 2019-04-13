'use strict';

const { get } = require('./api/middleware/login');
const authenticate = require('./api/middleware/authenticate');
const logout = require('./api/middleware/logout');

const cookieSecret = 'oST1Thr2s/iOAUgeK4yuuA==';

const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: true,
    signed: true,
};

const sessionOptions = {
    cookie: cookieOptions,
    saveUninitialized: false,
    secret: cookieSecret,
    resave: false,
};

// define all of the defaults for Linz, these can be overriden
const defaults = {

    // admin UI
    'admin home': '/models/list',
    'admin path': '/admin',
    'admin title': 'Linz',
    'login path': '/admin/login',
    'logout path': '/admin/logout',

    // password reset related defaults
    'admin forgot password path': '/forgot-your-password',
    'admin password reset path': '/password-reset',
    'admin password pattern': '(?=(?:^.{8,}$))(?=(?:.*?[a-z]{1,}?))(?=(?:.*?[A-Z]{1,}?))(?=(?:.*?[0-9]{1,}?))(?=(?:.*?(?:\\W{1,}?|\\D{1,}?)))',
    'admin password pattern help text': 'Min. 8 characters. Must contain at least 1 uppercase letter, 1 lowercase leter, a symbol (e.g. ! ~ *) and a number.',

    // routes
    'routes': {},

    // models
    'load models': true,

    // configs
    'load configs': true,
    'configs collection name': 'linzconfigs',

    // user model and authentication
    'username key': 'username',
    'password key': 'password',

    // error logging and output
    'error log': console.log,

    // admin ui settings
    'page size': 20,
    'page sizes': [20, 50, 100, 200],
    'date format': 'ddd, ll',
    'datetime format': 'llll',
    'set local time': false,

    // permissions
    'permissions': function (user, context, permission, callback) {
        return callback(true);
    },

    // sets an array of middleware functions to handle login
    'login middleware': {
        get: [get],
        post: [authenticate('linz-local', { failureFlash: true })]
    },

    // sets an array of middleware functions to handle logout
    'logout middleware': {
        get: [logout]
    },

    // cache
    'disable navigation cache': false,

    'navigationTransform': nav => nav,

    // Custom body tag classes.
    customAttributes: () => [],

    'mongoOptions': {
        useMongoClient: true
    },

    'csrf options': {},

    'cookie secret': cookieSecret,

    'cookie options': cookieOptions,

    'session options': sessionOptions,

};

module.exports = defaults;

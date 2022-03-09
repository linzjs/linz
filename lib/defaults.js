'use strict';

const { get, post } = require('./api/middleware/login');
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
    // Allow overriding 3rd party script and style locations
    'requiredScripts': {
        'bootstrap-datetimepicker.min.js': {
            crossorigin: 'anonymous',
            integrity: 'sha256-5YmaxAwMjIpMrVlK84Y/+NjCpKnFYa8bWWBbUHSBGfU=',
            src:
                '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/js/bootstrap-datetimepicker.min.js',
        },
        'bootstrap.min.js': {
            crossorigin: 'anonymous',
            integrity:
                'sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa',
            src:
                '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
        },
        'deep-diff.min.js': {
            crossorigin: 'anonymous',
            integrity: 'sha256-/wPGlKXtfdj9ryVH2IQ78d1Zx2/4PXT/leOL4Jt1qGU=',
            src:
                '//cdnjs.cloudflare.com/ajax/libs/deep-diff/0.2.0/deep-diff.min.js',
        },
        'handlebars.min.js': {
            crossorigin: 'anonymous',
            integrity: 'sha256-0JaDbGZRXlzkFbV8Xi8ZhH/zZ6QQM0Y3dCkYZ7JYq34=',
            src:
                '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js',
        },
        'jquery-migrate.min.js': {
            crossorigin: 'anonymous',
            integrity: 'sha256-JklDYODbg0X+8sPiKkcFURb5z7RvlNMIaE3RA2z97vw=',
            src:
                '//cdnjs.cloudflare.com/ajax/libs/jquery-migrate/3.0.0/jquery-migrate.min.js',
        },
        'jquery-ui.min.js': {
            crossorigin: 'anonymous',
            integrity: 'sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=',
            src:
                '//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
        },
        'jquery.min.js': {
            crossorigin: 'anonymous',
            integrity: 'sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=',
            src: '//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js',
        },
        'json2.min.js': {
            crossorigin: 'anonymous',
            integrity: 'sha256-ytdI1WZJO3kDPOAKDA5t95ehNAppkvcx0oPRRAsONGo=',
            src: '//cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.min.js',
        },
        'moment.min.js': {
            crossorigin: 'anonymous',
            integrity: 'sha256-CutOzxCRucUsn6C6TcEYsauvvYilEniTXldPa6/wu0k=',
            src:
                '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js',
        },
    },
    'requiredStyles': {
        'bootstrap-datetimepicker.min.css': {
            crossorigin: 'anonymous',
            href:
                '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.47/css/bootstrap-datetimepicker.min.css',
            integrity: 'sha256-yMjaV542P+q1RnH6XByCPDfUFhmOafWbeLPmqKh11zo=',
        },
        'bootstrap.min.css': {
            crossorigin: 'anonymous',
            href:
                '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
            integrity:
                'sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u',
        },
        'font-awesome.min.css': {
            crossorigin: 'anonymous',
            href:
                '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
            integrity:
                'sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN',
        },
    },

    // admin UI
    'admin home': '/models/list',
    'admin path': '/admin',
    'admin title': 'Linz',
    'login path': '/admin/login',
    'logout path': '/admin/logout',

    // password reset related defaults
    'admin forgot password path': '/admin/forgot-your-password',
    'admin password reset path': '/password-reset',
    'admin password pattern':
        '(?=(?:^.{8,}$))(?=(?:.*?[a-z]{1,}?))(?=(?:.*?[A-Z]{1,}?))(?=(?:.*?[0-9]{1,}?))(?=(?:.*?(?:\\W{1,}?|\\D{1,}?)))',
    'admin password pattern help text':
        'Min. 8 characters. Must contain at least 1 uppercase letter, 1 lowercase leter, a symbol (e.g. ! ~ *) and a number.',

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
    'permissions': function(user, context, permission, callback) {
        return callback(true);
    },

    // sets an array of middleware functions to handle login
    'login middleware': {
        get: [get],
        post: [post],
    },

    // sets an array of middleware functions to handle logout
    'logout middleware': {
        get: [logout],
    },

    // cache
    'disable navigation cache': false,

    'navigationTransform': (nav) => nav,

    // Custom body tag classes.
    'customAttributes': () => [],

    'mongoOptions': {
        useMongoClient: true,
    },

    'csrf options': {},

    'cookie secret': cookieSecret,

    'cookie options': cookieOptions,

    'session options': sessionOptions,
};

module.exports = defaults;

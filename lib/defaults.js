
// define all of the defaults for Linz, these can be overriden
module.exports = {

    // admin UI
    'admin home': '/models/list',
    'admin path': '/admin',
    'admin title': 'Linz',

    // password reset related defaults
    'admin forgot password path': '/forgot-your-password',
    'admin password reset path': '/password-reset',
    'admin password pattern': '(?=(?:^.{8,}$))(?=(?:.*?[a-z]{1,}?))(?=(?:.*?[A-Z]{1,}?))(?=(?:.*?[0-9]{1,}?))(?=(?:.*?(?:\\W{1,}?|\\D{1,}?)))',
    'admin password pattern help text': 'Min. 8 characters. Must contain at least 1 uppercase letter, 1 lowercase leter, a symbol (e.g. ! ~ *) and a number.',

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
    'cookie secret': 'oST1Thr2s/iOAUgeK4yuuA==',
    'date format': 'ddd, ll',
    'datetime format': 'llll',
    'set local time': false,

    // permissions
    'permissions': function (user, context, permission, callback) {
        return callback(true);
    },

    // sets an array of middleware functions to handle login
    'login middleware': {
        get: [require('../middleware-public/login').get],
        post: [require('../middleware-public/authenticate')('linz-local', { failureFlash: true })]
    },

    // sets an array of middleware functions to handle logout
    'logout middleware': {
        get: [require('../middleware-public/logout')]
    },

    // cache
    'disable navigation cache': false,

    'navigationTransform': nav => nav,

    // Scripts and styles.
    'scripts': () => Promise.resolve([]),
    'styles': () => Promise.resolve([]),

    // Custom body tag classes.
    customAttributes: () => [],

};

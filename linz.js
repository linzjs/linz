"use strict";

const { deprecate } = require('util');

/**
 * Load required modules
 */
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    path = require('path'),
    events = require('events'),
    bunyan = require('bunyan'),
    async = require('async'),
    lessMiddleware = require('less-middleware'),
    flash = require('connect-flash');

/**
 * Define error handling loggers
 */
var debugModels = require('debug')('linz:models'),
    debugConfigs = require('debug')('linz:configs'),
    debugGeneral = require('debug')('linz:general'),
    debugSet = require('debug')('linz:set');

/**
 * Linz constructor
 */
function Linz () {

    // internal properties
    this.settings = {};
    this.loggers = {};

    // apply default linz options
    this.options(require('./lib/defaults'));

}

/**
 * Linz inherits from EventEmitter for Linz.prototype.on('event') handling
 *
 */
 Linz.prototype.__proto__ = events.EventEmitter.prototype;

/**
 * Internal method used to setup options
 *
 * @return Linz for chaining
 */

Linz.prototype.options = function (opts) {

    var _this = this,
        opts = opts || {};

    for (var opt in opts) {
        _this.set(opt, opts[opt]);
    }

    return this;

};

/**
* Set a value or setting on Linz
*
* @return Linz for chaining
*/

Linz.prototype.set = function (setting, val, override) {

    if (arguments.length === 1) {
        return this.settings[setting];
    }

    // can only set the following values once
    var onceOnly = ['models path'];

    if (onceOnly.indexOf(setting) >= 0 && this.settings[setting] !== undefined) {
        return debugSet('You can only set \'' + setting + '\' once. Ignoring set this time.');
    }

    // defaults to true
    override = !(override === false);

    // override unless previously set
    if (override || override === false && this.settings[setting] === undefined) {
        debugSet('Setting ' + setting + ' to ' + val);
        this.settings[setting] = val;
        this.emit(setting, val);
    }

    return this;

};

/**
* Get a value or setting on Linz
*
* @return setting value
*/

Linz.prototype.get = function (setting) {
    return this.settings[setting];
};

/*
* Set a settings value to true
* synonym for admin.set('setting', true);
* @return Linz for chaining
*/

Linz.prototype.enable = function (setting) {
    this.set(setting, true);
    return this;
};

/*
* Set a settings value to false
* synonym for admin.set('setting', false);
* @return Linz for chaining
*/
Linz.prototype.disable = function (setting) {
    this.set(setting, false);
    return this;
};

/**
 * Expose Linz
 */
var linz = module.exports = exports = new Linz;

/**
 * Expose linz modules
 */
linz.hbs = require('./lib/hbs-helpers');
linz.formtools = require('./lib/formtools');
linz.versions = require('./lib/versions');
linz.concurrencyControl = require('./lib/concurrency-control');
linz.middleware = require('./middleware-public');
linz.api = require('./lib/api');
linz.utils = require('./lib/utils');

/**
 * Define local variables used by the Linz class
 */
var middlewareManager = require('./lib/middleware'),
    routesManager = require('./lib/router'),
    helpersModels = require('./lib/helpers-models'),
    helpersConfigs = require('./lib/helpers-configs'),
    libPassport = require('./lib/passport'),
    error = require('./lib/errors');

/**
 * Initialize linz with the express app
 * signature: app, mongoose, options
 *
 */
Linz.prototype.init = function (opts = {}) {

    // Use anything that has been passed through, or default it as required.
    this.app = opts.express || express();
    this.mongoose = opts.mongoose || require('mongoose');
    this.passport = opts.passport || require('passport');

    // overlay runtime options, these will override linz defaults
    this.options(opts.options || {});

    // configure everything
    this.configure();

    return this;

};

/**
* Initialize the application
*
* @api private
*/

Linz.prototype.configure = function() {

    var _this = this;

    // Start connecting to the database, prior to actually needing it.
    // This will speed up Initialisation of Linz a little.
    // Check for either a connect(ed|ing) mongoose object, or mongoose URI.
    if ([1,2].indexOf(_this.mongoose.connection.readyState) < 0) {

        if (!_this.get('mongo')) {
            throw new Error('You must either supply a connected mongoose object, or a mongo URI');
        }

        debugGeneral('Connecting to the database');

        _this.mongoose.connect(_this.get('mongo'), _this.get('mongoOptions'));
        _this.mongoose.connection.once('connected', function () {
            debugGeneral('Database connected');
        });

    }

    async.series([

        function (cb) {
            return _this.defaultConfiguration(cb);
        },

        function (cb) {
            return _this.bootstrapExpress(cb);
        },

        function (cb) {
            return _this.mountAdmin(cb);
        },

        function (cb) {
            return _this.setupORM(cb);
        },

        function (cb) {
            return _this.loadConfigs(cb);
        },

        function (cb) {

            _this.set('app', _this.app);

            // Wait until we have a connection to the database to proceed.
            var intervalId = setInterval(function () {

                if (_this.mongoose.connection.readyState === 1) {
                    clearInterval(intervalId);
                    _this.initConfigs(cb);
                }

            }, 100);

        },

        function (cb) {
            return _this.loadModels(cb);
        },

        function (cb) {
            return _this.buildNavigation(cb);
        },

        function (cb) {
            return _this.bootstrapExpressLocals(cb);
        },

        function (cb) {
            return _this.checkSetup(cb);
        }

    ], function (err) {

        if (err) {
            throw err;
        }

        return _this.emit('initialised');

    });

};

/**
* Load ORM
*
* @return void
*/
Linz.prototype.setupORM = function (cb) {

    // extend the mongoose types
    helpersModels.extendTypes();

    return cb(null);

};

/**
* Search and look for the models folder, then go ahead and load them
*
* @return void
*/
Linz.prototype.loadModels = function (cb) {

    if (!this.get('load models')) {

        this.set('models', {});

        return cb();

    }

    var _this = this;

    // set the default models path
    this.set('models path', path.resolve(this.get('cwd'), 'models'), false);

    var modelsPath = this.get('models path');

    helpersModels.loadModels(modelsPath)
        .then((models) => {

            _this.set('models', models || {});

            return helpersModels.initModels();

        })
        .then(() => cb())
        .catch(cb);

};

/**
* Search and look for the configs folder, then go ahead and load them
*
* @return void
*/
Linz.prototype.loadConfigs = function (cb) {

    if (!this.get('load configs')) {

        this.set('configs', {});
        return cb(null);

    }

    // set the default configs path
    this.set('configs path', path.resolve(this.get('cwd'), 'configs'), false);

    var configsPath = this.get('configs path');

    this.set('configs', helpersConfigs.loadConfigs(configsPath));

    return cb(null);

};

/**
* Load document from configs collection and create new ones if none are found.
*
* @return void
*/
Linz.prototype.initConfigs = function (cb) {


    var db = this.mongoose.connection.db,
        configs = this.get('configs');

    db.collection(this.get('configs collection name'), function (err, collection) {

        async.each(Object.keys(configs), function (configName, initDone) {

            collection.findOne({ _id: configName }, function (err, doc) {

                if (err) {
                    return initDone(err);
                }

                if (doc) {

                    var updatedDoc = {};

                    // doc exists, check if there are any new properties
                    configs[configName].schema.eachPath(function (fieldName, field) {

                        if (doc[fieldName] === undefined) {
                            updatedDoc[fieldName] = linz.formtools.utils.getDefaultValue(field);
                            doc[fieldName] = updatedDoc[fieldName];
                        }

                    });

                    if (!Object.keys(updatedDoc).length) {

                        configs[configName].config = doc;
                        debugConfigs('Initialised config %s', configName);

                        // since there are no change, return early
                        return initDone(null);
                    }

                    // update doc with changes
                    return collection.update({ _id: configName }, { $set: updatedDoc }, { w:1 }, function (err, result) {

                        if (err) {
                            throw new Error('Unable to write config file %s to database. ' + err.message, configName);
                        }

                        // add config to linz
                        configs[configName].config = doc;

                        debugConfigs('Initialised config %s', configName);

                        return initDone(err);

                    });

                }

                var newConfig = {};

                // contruct doc from config schema
                configs[configName].schema.eachPath(function (fieldName, field) {
                    newConfig[fieldName] = linz.formtools.utils.getDefaultValue(field);
                });

                // overwrite _id field with custom id name
                newConfig['_id'] = configName;

                // Use update instead of insert to prevent duplicate key errors.
                collection.update(newConfig, {
                    upsert: true,
                    w:1,
                }, function(err, result) {

                    if (err) {
                        throw new Error('Unable to write config file %s to database. ' + err.message, configName);
                    }

                    debugConfigs('Initialised config %s', configName);

                    // add new config to linz
                    configs[configName].config = newConfig;

                    return initDone(null);

                });

            });

        }, cb);

    });

};


/**
* Setup the default configuration for Linz
*
* @return void
*/
Linz.prototype.defaultConfiguration = function (cb) {

    var _this = this;

    debugGeneral('Setting up the default configuration');

    // setup the router
    this.router = routesManager.getRouter();

    // assign the default middleware (across all routes)
    middlewareManager.mountDefaults(this.app);

    // assign admin specific middleware
    middlewareManager.mountAdminMiddleware(this.router);

    // assign the route params
    routesManager.setupParams();

    // assign the admin routes
    routesManager.setupAdminRoutes();

    // assign the model CRUD routes
    routesManager.setupModelRoutes();

    // assign the config CRUD routes
    routesManager.setupConfigsRoutes();

    // assign the logging routes
    if (this.get('request logging') === true) routesManager.setupLoggingRoutes();

    // store the cwd
    this.set('cwd', process.cwd());

    // place holder for the models, which get loaded in next
    this.set('models', []);

    return cb(null);

};

Linz.prototype.mountAdmin = function (cb) {

    debugGeneral('Mounting Linz on ' + this.get('admin path'));
    this.app.use(this.get('admin path'), this.router);

    return cb(null);
};

/**
* We need to setup the host express app with a few bits and pieces
*
* @api private
*/
Linz.prototype.bootstrapExpress = function (cb) {

    // only run once
    if (this.bBootstrapExpress) {
        return cb(null);
    }

    if (!this.bBootstrapExpress) {
        this.bBootstrapExpress = true;
    }

    debugGeneral('Bootstrapping express');

    // Setup `/public` middleware first as we don't need session handle to resolve this routes

    if ((process.env.NODE_ENV || 'development') === 'development') {

        this.app.use(this.get('admin path') + '/public', lessMiddleware(__dirname + '/public', {
            force: true,
            preprocess: {
                path: function (pathname, reqs) {
                    return pathname.replace(/\/css/, '/src/css');
                }
            }
        }));
    }

    // setup admin static routes
    this.app.use(this.get('admin path') + '/public/', express.static(path.resolve(__dirname, 'public')));

    this.app.engine('jade', require('jade').__express);
    this.app.set('view engine', 'jade');

    // setup body-parser, and cookie-parser
    this.app.use(bodyParser());

    // need to hook in custom cookie parser if provided
    if (typeof this.get('cookie parser') === 'function') {
        this.app.use(this.get('cookie parser'));
    } else {
        this.app.use(cookieParser((this.get('cookie secret'))));
    }

    // need to hook session in here as it must be before passport.initialize
    if (typeof this.get('session middleware') === 'function') {
        this.app.use(this.get('session middleware'));
    } else {
        this.app.use(expressSession({ secret: this.get('cookie secret') }));
    }

    // setup connect-flash
    this.app.use(flash());

    // configure passport
    libPassport(this.passport);

    // initialize passport (on all routes)
    this.app.use(this.passport.initialize());
    this.app.use(this.passport.session());


    return cb(null);

};

/**
* Setup express locals for admin template generation
*
* @api private
*/
Linz.prototype.bootstrapExpressLocals = function (cb) {

    // expose our settings to the rendering engine
    this.app.locals['linz'] = this;

    this.app.locals['adminPath'] = this.get('admin path');

    this.app.locals['adminTitle'] = this.get('admin title');

    this.app.locals['env'] = process.env.NODE_ENV || 'development';

    if (this.get('css file')) {
        deprecate(() => {
            this.app.locals.adminCSSFile = this.get('css file');
        }, 'adminCSSFile: Use the styles default instead')();
    }

    if (this.get('js file')) {
        deprecate(() => {
            this.app.locals.adminJSFile = this.get('js file');
        }, 'adminJSFile: Use the scripts default instead')();
    }

    return cb(null);

};


/*
* Set a settings value to true
* synonym for admin.set('setting', true);
* @return Linz for chaining
*/

Linz.prototype.enable = function (setting) {
    this.set(setting, true);
    return this;
};

/*
* Set a settings value to false
* synonym for admin.set('setting', false);
* @return Linz for chaining
*/
Linz.prototype.disable = function (setting) {
    this.set(setting, false);
    return this;
};


/*
* Return the linz navigation structure. This is the complete navigation structure.
* It will be further manipulated by middleware (using the API) to customise per user.
*
* @api private
*/
Linz.prototype.buildNavigation = function (cb) {

    var nav = [],
        _this = this,
        linzModels = this.get('models'),
        linzConfigs = this.get('configs');

    // models, configs and logs
    async.parallel([

        function (done) {

            // add a reference for all of the models
            var models = {
                name: 'Models',
                href: _this.get('admin path') + '/models/list',
                children: [],
                permission: function (user, callback) {
                    return linz.api.permissions.hasPermission(user, 'models', 'canList', callback);
                }
            };

            async.each(Object.keys(linzModels), function (model, callback) {

                // get the model options
                linzModels[model].getModelOptions(function (err, options) {

                    if (err) {
                        return callback(err);
                    }

                    if (options.hide === true) {
                        return callback(null);
                    }

                    models.children.push({
                        name: linzModels[model].linz.formtools.model.plural,
                        href: _this.get('admin path') + '/model/' + model + '/list',
                        permission: function (user, permCallback) {
                            return linz.api.permissions.hasPermission(user, { type: 'model', model: model }, 'canList', permCallback);
                        }
                    });

                    return callback(null);

                });


            }, function (err) {

                if (err) {
                    return done(err);
                }

                nav.push(models);

                return done();

            });

        },

        function (done) {

            // add a reference for configs, if we have some
            if (Object.keys(linzConfigs).length) {

                var configs = {
                    name: 'Configs',
                    href: _this.get('admin path') + '/configs/list',
                    permission: function (user, callback) {
                        return linz.api.permissions.hasPermission(user, 'configs', 'canList', callback);
                    }
                };

                nav.push(configs);

            }

            return done(null);

        },

        // this function will run and return either a no-op function,
        // or a function that will execute the 'navigation configuration' function and override
        // nav with the customisation as returned to the callback
        (function () {

            // if we don't have a function, return a no-op that will simply execute the callback with null
            if (typeof _this.get('navigation configuration') !== 'function') {
                return linz.utils.noOp();
            }

            return function (done) {

                return _this.get('navigation configuration')(nav, function (err, _nav) {

                    if (err) {
                        errors.log('The navigation configuration function errored.');
                        return done(null);
                    }

                    // override with the newly updated navigation
                    nav = _nav;

                    return done(null);

                });

            }

        })()

    ], function (err) {

        // set this data on linz
        _this.set('navigation', nav);

        // return the callback
        return cb(err);

    });

}

/**
 * Check the setup of linz and make sure we've got everything we require
 * @return {[type]} [description]
 */
Linz.prototype.checkSetup = function(cb) {

    if (this.get('user model') === undefined) {
        error.log('You must define a user model');
    }

    return cb(null);

};

/**
* Create a logger which you can use in your applications.
* Linz uses bunyan internally and exposes this method to easily create logs within your application.
*
* @param {String|Object} options
* @return an instance of the logger
* @api public
*/
Linz.prototype.logger = function (options) {

    // user can pass either a String or an Object
    if (typeof options === 'string') options = {name: options};

    // The name parameter must exist
    if (!options.name) throw new Error('You must pass the name parameter when creating a logger.');

    // If we haven't already created a logger, create one now, transparently passing the options
    if (!this.loggers[options.name]) {
        this.loggers[options.name] = bunyan.createLogger(options);
    }

    return this.loggers[options.name];

};

/**
 * Initialise the models.
 * @returns {Void} Intialises the models, setting up some linz properties.
 */
Linz.prototype.initModels = () => helpersModels.initModels();

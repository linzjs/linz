"use strict";

/**
 * Load required modules
 */
var	express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	expressSession = require('express-session'),
	path = require('path'),
	moment = require('moment'),
	events = require('events'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	bunyan = require('bunyan'),
    async = require('async');

/**
 * Linz constructor
 */
function Linz () {

	// internal properties
	this.settings = {};
	this.loggers = {};

}

/**
 * Expose Linz
 */
var linz = module.exports = exports = new Linz;

/**
 * Define local variables used by the Linz class
 */
var	routesManager = require('./lib/router'),
	passportHelpers = require('./lib/helpers-passport'),
	helpersModels = require('./lib/helpers-models'),
    helpersConfigs = require('./lib/helpers-configs'),
	debugModels = require('debug')('linz:models'),
    debugConfigs = require('debug')('linz:configs'),
	debugGeneral = require('debug')('linz:general'),
	debugSet = require('debug')('linz:set'),
	error = require('./lib/errors');

/**
 * Expose linz modules
 */
linz.formtools = require('./lib/formtools');
linz.middleware = require('./middleware-public');
linz.api = require('./lib/api');
linz.utils = require('./lib/utils');

/**
 * Linz inherits from EventEmitter for Linz.prototype.on('event') handling
 *
 */
 Linz.prototype.__proto__ = events.EventEmitter.prototype;

/**
 * Initialize linz with the express app
 * signature: app, mongoose, options
 *
 */
Linz.prototype.init = function () {

	var _app,
		_mongoose,
		_options;

	// loop through the arguments, and determine what is what
	for (var i = 0; i < arguments.length; i++) {

		var arg = arguments[i];

		if (arg.constructor.name === 'Mongoose') {
            debugGeneral('Using passed in mongoose object');
			_mongoose = arg;
		} else if (arg.constructor.name === 'Function' && typeof arg === 'function') {
            debugGeneral('Using passed in express app');
			_app = arg;
		} else  if (arg.constructor.name === 'Object' && typeof arg === 'object') {
            debugGeneral('Found options configuration object');
			_options = arg;
		}

	}

	// use anything that is passed in
	_app = _app || express();
	_mongoose = _mongoose || require('mongoose');
	_options = _options || {};

	// reference required properties
	this.app = _app;
	this.mongoose = _mongoose;

	// apply default linz options
	this.options(require('./lib/defaults'));

	// overlay runtime options, these will override linz defaults
	this.options(_options);

	this.on('admin path', function () {

		this.app.locals['linzNavigation'] = [
			{
				name: 'Models',
				href: this.get('admin path') + '/models/list'
			},
			{
				name: 'Logs',
				href: this.get('admin path') + '/logs/request/list'
			},
			{
				name: 'Logout',
				href: this.get('admin path') + '/logout'
			}
		];

	});

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

            // check for either a connect(ed|ing) mongoose object, or mongoose URI
            if ([1,2].indexOf(_this.mongoose.connection.readyState) < 0) {

                if (!_this.get('mongo')) {
                    throw new Error('You must either supply a connected mongoose object, or a mongo URI');
                }

                _this.mongoose.connect(_this.get('mongo'));
                _this.mongoose.connection.on('connected', function () {
                    _this.initConfigs(cb);
                });

            } else {
                return cb(null);
            }

        },

        function (cb) {
            return _this.loadModels(cb);
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

		this.set('models', []);
        return cb(null);

	}

	// set the default models path
	this.set('models path', path.resolve(this.get('cwd'), 'models'), false);

	var modelsPath = this.get('models path');

	this.set('models', helpersModels.loadModels(modelsPath));

    return cb(null);

};

/**
* Search and look for the configs folder, then go ahead and load them
*
* @return void
*/
Linz.prototype.loadConfigs = function (cb) {

    if (!this.get('load configs')) {

        this.set('configs', []);
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

                collection.insert(newConfig, {w:1}, function(err, result) {

                    if (err) {
                        throw new Error('Unable to write config file %s to database. ' + err.message, configName);
                    }

                    debugConfigs('Initialised config %s', configName);

                    // add new config to linz
                    configs[configName].config = newConfig;

                    return initDone(null);

                });

            });

        }, function (err) {
            return cb(err);
        });

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

	this.app.engine('jade', require('jade').__express);
	this.app.set('view engine', 'jade');

	// setup body-parser, and cookie-parser
	this.app.use(bodyParser());
	this.app.use(cookieParser());

	// need to hook session in here as it must be before passport.initialize
	if (typeof this.get('session middleware') === 'function') {
		this.app.use(this.get('session middleware'));
	} else {
		this.app.use(expressSession({ secret: 'linzcookiesecret' }));
	}

	// initialize passport
	this.app.use(this.get('admin path'), passport.initialize());
	this.app.use(this.get('admin path'), passport.session());

	// setup stylus for admin css
	this.app.use(this.get('admin path') + '/public/', require('stylus').middleware(path.resolve(__dirname, 'public')));

	// setup admin static routes
	this.app.use(this.get('admin path') + '/public/', express.static(path.resolve(__dirname, 'public')));

	// setup passport for authentication
	passport.use('linz-local', passportHelpers.login);

	// add serialize and deserialize functionality
	passportHelpers.setupPassport(passport);

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

	// expose the linz admin navigation
	this.app.locals['linzNavigation'] = this.buildNavigation();

	this.app.locals['adminPath'] = this.get('admin path');

	this.app.locals['adminTitle'] = this.get('admin title');

    this.app.locals['env'] = process.env.NODE_ENV || 'development';

    return cb(null);

};

Linz.prototype.options = function (opts) {

	var _this = this,
		opts = opts || {};

	for (var opt in opts) {
		_this.set(opt, opts[opt]);
	}

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


/*
* Return the linz navigation structure
*
* @api private
*/
Linz.prototype.buildNavigation = function () {

	var nav = [],
		_this = this,
		linzModels = this.get('models');

	// add a reference for all of the models
	var models = {
		name: 'Models',
		href: this.get('admin path') + '/models/list',
		children: [
			{
				'name': 'All',
				href: this.get('admin path') + '/models/list'
			}
		]
	};

	// add each model to the navigation tree
	Object.keys(linzModels).forEach(function (model) {

		models.children.push({
			name: linzModels[model].label,
			href: _this.get('admin path') + '/model/' + model + '/list'
		});

	});
	nav.push(models);

    // add a reference for configs
    var configs = {
        name: 'Configs',
        href: this.get('admin path') + '/configs/list'
    };
    nav.push(configs);

	// add a reference for the logs
	var logs = {
		name: 'Logs',
		href: this.get('admin path') + '/logs/request/list'
	};
	nav.push(logs);

	return nav;

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

var path = require('path'),
	fs = require('fs'),
    async = require('async'),
	error = require('./errors'),
	debugModels = require('debug')('linz:models');

exports.extendTypes = function () {

	// add custom types to mongoose
	require('./formtools/extend-types')();

};

exports.loadModels = function loadModels (dir, cb) {

	debugModels('Loading models from directory, %s', dir);

	var dir = path.resolve(process.cwd(), dir),
		files = [],
		models = [];

    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        debugConfigs('Error: Unable to load models from directory, %s', dir);
        error.log(e.stack + '\n');
        return configs;
    }

    async.each(files, function(file, done) {

        var name = path.basename(file, '.js');
        if (name === 'index') {
            return;
        }

        try {
            models[name] = require(dir + '/' + name);
        } catch (e) {
            debugModels('Error when loading model %s', name);
            return error.log(e.stack + '\n');
        }

        // add the formtools key
        models[name].formtools = {};

        async.parallel([

            // map getGrid results as grid
            function (callback) {

                models[name].getGrid(function (err, grid) {
                    models[name].formtools.grid = grid;
                    return callback(null);
                });

            },

            // map getForm results as form
            function (callback) {

                models[name].getForm(function (err, form) {
                    models[name].formtools.form = form;
                    return callback(null);
                });

            },

            // map getOverview results as overview
            function (callback) {

                models[name].getOverview(function (err, overview) {
                    models[name].formtools.overview = overview;
                    return callback(null);
                });

            },

            // map getModelOptions results as model
            function (callback) {

                models[name].getModelOptions(function (err, model) {
                    models[name].formtools.model = model;
                    return callback(null);
                });

            },

            function (callback) {

                if (!models[name].getVersionsSettings) {
                    return callback(null);
                }

                models[name].getVersionsSettings(function (err, settings) {

                    if (err) {
                        return callback(err);
                    }

                    // add the versions key
                    models[name].versions = settings;

                    return callback(null);

                });

            }

        ], function (err) {

            debugModels('Loaded model %s', name);

            return done(null);

        });

    }, function (err) {

        // non-standard callback here
        return cb(models);

    });

};

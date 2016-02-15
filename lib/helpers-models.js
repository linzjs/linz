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

    dir = path.resolve(process.cwd(), dir);

    var files = [],
        models = [];

    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        debugModels('Error: Unable to load models from directory, %s', dir);
        error.log(e.stack + '\n');
        return;
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
            error.log(e.stack + '\n');
			return;
        }

        // add the formtools key in the linz namespace
        models[name].linz = {
            formtools: {}
        };

        console.log('helpers-models.js');

        async.parallel([

            // map getModelOptions results as model
            function (callback) {

                models[name].getModelOptions(function (err, model) {
                    models[name].linz.formtools.model = model;
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

            },

            function (callback) {

                if (!models[name].getConcurrencyControlOptions) {
                    return callback(null);
                }

                models[name].getConcurrencyControlOptions(function (err, settings) {

                    if (err) {
                        return callback(err);
                    }

                    // add the versions key
                    models[name].concurrencyControl = settings;

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

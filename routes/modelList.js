var path = require('path'),
    async = require('async'),
    linz = require('../');

/* GET /admin/models/list */
var route = function (req, res, next) {

    var models = linz.get('models');

    async.seq(

        // don't show those that have been marked to hide
        function (_models, callback) {

            async.filter(_models, function (model, cb) {

                return cb(!models[model].linz.formtools.model.hide);

            }, function (results) {

                return callback(null, results);

            });

        },

        // optionally, run these through the permissions function
        (function () {

            // skip this step if we're using the default permissions function
            if (linz.get('permissions').name === 'defaultPermissions') {
                return function (_models, callback) {
                    return callback(null, _models);
                }
            }

            return function (_models, callback) {

                async.filter(_models, function (model, cb) {

                    linz.get('permissions')(req.user, 'list', {
                        type: 'navigation',
                        placement: 'model-index',
                        data: models[model]
                    }, cb);

                }, function (results) {
                    return callback(null, results);
                });

            }

        })(),

        // return an array of actual models
        function (_models, callback) {

            async.map(_models, function (model, cb) {

                return cb(null, models[model]);

            }, callback);

        }

    )(Object.keys(models), function (err, modelsList) {

        if (err) {
            return next(err);
        }

        res.render(linz.api.views.viewPath('modelList.jade'), {
            models: modelsList
        });

    });

};

module.exports = route;

'use strict';

const async = require('async');
const linz = require('../');

/* GET /admin/models/list */
var route = function (req, res, next) {

    var models = linz.get('models'),
        data = {};

    async.seq(

        function (_models, callback) {

            // filter by hidden models
            _models = _models.filter(function (model) {
                return !models[model].linz.formtools.model.hide;
            });

            return callback(null, _models);

        },

        function (_models, callback) {

            // based on permissions, filter out some models
            async.filter(_models, function (model, cb) {

                linz.api.model.hasPermission(req.user, model, 'canList', function (result) {

                    // explicitly, a permission must return false in order to be denied
                    // an undefined permission, or anything other than false will allow the permission
                    // falsy does not apply in this scenario
                    return cb(null, result !== false);

                });

            }, function (results) {

                return callback(null, results);

            });

        },

        // return an array of actual models
        function (_models, callback) {

            async.map(_models, function (model, cb) {

                return cb(null, models[model]);

            }, callback);

        },

        function (_models, callback) {

            linz.api.views.renderNotifications(req, (err, notificationHtml) => {

                if (err) {
                    return callback(err);
                }

                if (notificationHtml) {
                    data.notifications = notificationHtml;
                }

                return callback(null, _models);

            });

        }

    )(Object.keys(models), function (err, modelsList) {

        if (err) {
            return next(err);
        }

        return Promise.all([
            linz.api.views.getScripts(req, res),
            linz.api.views.getStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('modelList.jade'), Object.assign(data, {
                    customAttributes: res.locals.customAttributes,
                    models: modelsList,
                    pageTitle: 'Models',
                    scripts,
                    styles,
                }));

            })
            .catch(next);

    });

};

module.exports = route;

var path = require('path'),
    async = require('async'),
    linz = require('../');

/* GET /admin/models/list */
var route = function (req, res, next) {

    var models = linz.get('models');

    async.seq(

        function (_models, callback) {

            // filter by hidden models
            _models = _models.filter(function (model) {
                return !models[model].linz.formtools.model.hide;
            });

            // TODO: reimplement filtering based on permissions
            return callback(null, _models);

        },

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

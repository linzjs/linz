var path = require('path'),
    async = require('async'),
    linz = require('../');

/* GET /admin/models/list */
var route = function (req, res) {

	var models = linz.get('models'),
        modelsToShow = {};

    // loop through each model, and determine if it should be displayed in list
    async.each(Object.keys(models), function (model, done) {

        if (!models[model].linz.formtools.model.hide) {
            modelsToShow[model] = models[model];
        }

        return done(null);

    }, function (err) {

        res.render(linz.api.views.viewPath('modelList.jade'), { models: modelsToShow });

    });

};

module.exports = route;

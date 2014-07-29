var path = require('path'),
    async = require('async');

/* GET /admin/models/list */
var route = function (req, res) {

	var models = linz.get('models'),
        modelsToShow = {};

    // loop through each model, and determine if it should be displayed in list
    async.each(Object.keys(models), function (model, done) {

        if (!models[model].linz.model.hide) {
            modelsToShow[model] = models[model];
        }

        return done(null);

    }, function (err) {

        res.render(req.linz.views + '/modelList.jade', { models: modelsToShow });

    });

};

module.exports = route;

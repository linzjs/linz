var util = require('util'),
	async = require('async'),
    linz = require('../');


module.exports = {

    get: function (req, res, next) {

        if (req.session[req.params.model] && req.session[req.params.model].records) {

            req.linz.records = req.session[req.params.model].records;
            req.linz.model = req.linz.get('models')[req.params.model];
            req.linz.model.grid = req.session[req.params.model].grid;
            req.linz.model.formData = req.session[req.params.model].formData;

            return next(null);

        }

        var helpers = require('./_modelIndex')(req, res, next);
        helpers.getModelIndex();

    },

    post: function (req, res, next) {

        var helpers = require('./_modelIndex')(req, res, next);
        helpers.getModelIndex();

    }

}

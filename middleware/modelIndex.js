var util = require('util'),
	async = require('async'),
    linz = require('../');


module.exports = {

    get: function (req, res, next) {

        var helpers = require('./_modelIndex')(req, res, next);
        helpers.getModelIndex();

    },

    post: function (req, res, next) {

        var helpers = require('./_modelIndex')(req, res, next);
        helpers.getModelIndex();
    }

}

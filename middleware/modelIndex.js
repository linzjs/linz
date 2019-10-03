var linz = require('../'),
    async = require('async');

module.exports = {
    get: function(req, res, next) {
        var helpers = require('./_modelIndex')(req, res, next);
        helpers.getModelIndex();
    },

    post: function(req, res, next) {
        var helpers = require('./_modelIndex')(req, res, next);
        helpers.getModelIndex();
    },
};

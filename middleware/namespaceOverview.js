'use strict';

const linz = require('../');

// This namespace will by used by Linz.
module.exports = function linzNamespaceOverview (req, res, next) {

    linz.api.model.overview(req, req.user, req.linz.model.modelName, function(err, overview) {

        if (err) {
            return next(err);
        }

        req.linz.model.linz.formtools.overview = overview;

        return next();

    });

}

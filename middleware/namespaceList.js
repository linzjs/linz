'use strict';

const linz = require('../');

// This namespace will by used by Linz.
module.exports = function linzNamespaceList (req, res, next) {

    linz.api.model.list(req.user, req.linz.model.modelName, function(err, list) {

        if (err) {
            return next(err);
        }

        req.linz.model.linz.formtools.list = list;

        return next();

    });

}

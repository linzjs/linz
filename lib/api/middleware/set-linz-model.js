'use strict';

const linz = require('../../../');

/**
 * Set req.linz.model
 * @returns {Void} Calls the next middleware.
 */
const setLinzModel = () => (req, res, next) => {

    const { model } = req.params;

    if (!model) {
        return next();
    }

    req.linz.model = linz.api.model.get(model);
    req.linz.model.linz.formtools.labels = linz.api.model.labels(model);

    linz.api.model.permissions(req.user, model, (err, permissions) => {

        if (err) {
            return next(err);
        }

        req.linz.model.linz.formtools.permissions = permissions;

        return next();

    });

};

module.exports = setLinzModel;

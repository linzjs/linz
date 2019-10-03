'use strict';

const linz = require('../../../');

/**
 * Get the model name from a request.
 * @param {Object} req The HTTP request object.
 * @returns {String} The model name.
 */
const getModelFromRequest = (req) => {
    // The param is config for config routes and model for others.
    const { params = {} } = req;
    const model = params.model || params.config;

    if (model) {
        return model;
    }

    const modelMatch = req.path.match(/(model\/\w*)/);

    if (!modelMatch) {
        return null;
    }

    const [path] = modelMatch;
    const [_, modelName] = path.split('/');

    return modelName;
};

/**
 * Set req.linz.model
 * @returns {Void} Calls the next middleware.
 */
const setLinzModel = () => (req, res, next) => {
    // The param is config for config routes and model for others.
    const model = getModelFromRequest(req);

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

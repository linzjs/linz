'use strict';

const linz = require('../');

// This namespace will by used by Linz.
module.exports = function linzNamespaceOverview (req, res, next) {

    linz.api.formtools.namespaceOverview(req)
        .then(() => next())
        .catch(next);

}

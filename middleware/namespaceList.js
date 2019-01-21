'use strict';

const linz = require('../');

// This namespace will by used by Linz.
module.exports = function linzNamespaceList (req, res, next) {

    linz.api.formtools.namespaceList(req)
        .then(() => next())
        .catch(next);

}

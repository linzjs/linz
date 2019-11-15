'use strict';

const linz = require('../');

// This namespace will by used by Linz.
module.exports = function linzNamespaceList (req, res, next) {

    Promise.all([
        linz.api.formtools.namespaceList(req),
        linz.api.formtools.namespaceForm(req),
    ])
        .then(() => next())
        .catch(next);

}

'use strict';

const linz = require('../');

// This namespace will by used by Linz.
module.exports = function linzNamespaceForm (req, res, next) {

    linz.api.formtools.namespaceForm(req)
        .then(() => next())
        .catch(next);

}

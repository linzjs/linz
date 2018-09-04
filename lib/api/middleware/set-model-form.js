'use strict';

const setLinzNamespace = require('./set-linz-namespace');

/**
 * Set req.linz.model.form.
 * @returns {Void} Calls the next middleware.
 */
const setModelForm = () => (req, res, next) => {

    setLinzNamespace(req, res, (namespaceErr) => {

        if (namespaceErr) {
            return next(namespaceErr);
        }

        if (!req.linz.model) {
            return next(new Error('Missing Linz model form'));
        }

        req.linz.model.getForm(req, (err, form) => {

            if (err) {
                return next(err);
            }

            req.linz.model.form = form;

            return next();

        });

    });

};

module.exports = setModelForm;

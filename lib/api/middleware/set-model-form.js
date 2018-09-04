'use strict';

/**
 * Set req.linz.model.form.
 * @returns {Void} Calls the next middleware.
 */
const setModelForm = () => (req, res, next) => {

    if (!req || !req.linz || !req.linz.model) {
        return next(new Error('Missing Linz model form'));
    }

    req.linz.model.getForm(req, (err, form) => {

        if (err) {
            return next(err);
        }

        req.linz.model.form = form;

        return next();

    });

};

module.exports = setModelForm;

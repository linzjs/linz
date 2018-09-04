'use strict';

/**
 * Set req.linz.record.
 * @returns {Void} Calls the next middleware.
 */
const setRecord = () => (req, res, next) => {

    if (!req || !req.linz || !req.linz.model) {
        return next(new Error('Missing Linz model form'));
    }

    req.linz.model.getObject(req.params.id, (err, doc) => {

        if (err || !doc) {
            return next(err);
        }

        req.linz.record = doc;

        return next();

    });

};

module.exports = setRecord;

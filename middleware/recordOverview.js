var linz = require('../'),
    async = require('async');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = linz.api.model.get(req.params.model);

        async.series([

            function (cb) {

                // get doc
                req.linz.model.getObject(req.params.id, function (err, doc) {

                    if (err) {
                        cb(err);
                    }

                    req.linz.record = doc;

                    return cb(null);

                });

            },

            function (cb) {

                req.linz.model.getForm(function(err,form){

                    if (err) {
                        cb(err);
                    }

                    req.linz.model.form = form;

                    return cb(null);

                });

            },

            function (cb) {

                req.linz.model.getOverview(function(err,overview){

                    if (err) {
                        cb(err);
                    }

                    req.linz.model.overview = overview;

                    return cb(null);

                });

            },

            // check if we need to process custom actions
            function (cb) {

                if (!req.linz.model.overview.actions.length) {
                    return cb(null);
                }

                async.each(req.linz.model.overview.actions, function (action, actionDone) {

                    if (!action.disabled) {
                        return actionDone(null);
                    }

                    if (typeof action.disabled !== 'function') {
                        throw new Error('Invalid type for overview.action.disabled. It must be a function.');
                    }

                    action.disabled(req.linz.record, function (err, isDisabled, message) {

                        action.isDisabled = isDisabled;

                        if (isDisabled === true) {
                            action.disabledMessage = message;
                        }

                        return actionDone(err);

                    });

                }, function (err) {

                    return cb(err);

                });

            }

        ], function (err, results) {

            return next(err);

        });

	}

}

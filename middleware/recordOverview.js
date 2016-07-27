var linz = require('../'),
    async = require('async');

module.exports = function () {

	return function (req, res, next) {

        req.linz.overview = req.linz.overview || {};

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

            // check if we need to process custom actions
            function (cb) {

                if (!req.linz.model.linz.formtools.overview.actions.length) {
                    return cb(null);
                }

                async.each(req.linz.model.linz.formtools.overview.actions, function (action, actionDone) {

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

            },

            function (cb) {

                linz.formtools.overview.body(req, res, req.linz.record, req.linz.model, function (err, body) {

                    if (err) {
                        return cb(err);
                    }

                    // body could be a string of HTML content OR an array of objects
                    req.linz.overview.body = body;

                    return cb();

                });

            },

            function (cb) {

                if (!req.linz.model.versions) {
                    return cb();
                }

                req.linz.model.versions.renderer(req, res, req.linz.record, req.linz.model, req.linz.model.versions, function (err, content) {

                    if (err) {
                        return cb(err);
                    }

                    req.linz.overview.versions = content;

                    return cb();

                });

            }

        ], next);

	};

};

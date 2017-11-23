var linz = require('../'),
    async = require('async');

module.exports = function () {

	return function (req, res, next) {

        req.linz.overview = req.linz.overview || {};
        const { parseDisabledProperties } = linz.api.formtools.actions;

        // get doc
        req.linz.model.getObject(req.params.id, function (err, doc) {

            // Skip to a 404 page.
            if (err || !doc) {
                return next(err);
            }

            req.linz.record = doc;

            async.series([

                // Check if we need to process custom actions.
                function (cb) {

                    let actions = req.linz.model.linz.formtools.overview.actions;

                    if (!actions.length) {
                        return cb(null);
                    }

                    parseDisabledProperties(req.linz.record, actions)
                        .then((parsedActions) => {

                            actions = parsedActions;

                            return cb();

                        })
                        .catch(cb);

                },

                // Check if we need to process custom footer actions.
                function (cb) {

                    let footerActions = req.linz.model.linz.formtools.overview.footerActions;

                    if (!footerActions.length) {
                        return cb();
                    }

                    parseDisabledProperties(req.linz.record, footerActions)
                        .then((parsedActions) => {

                            footerActions = parsedActions;

                            return cb();

                        })
                        .catch(cb);

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

        });

	};

};

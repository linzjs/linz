
var linz = require('../'),
    async = require('async'),
    clone = require('clone');


/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    var locals = {
        customAttributes: res.locals.customAttributes,
        formtools: req.linz.model.linz.formtools,
        model: req.linz.model,
        overview: req.linz.overview,
        permissions: req.linz.model.linz.formtools.permissions,
        record: clone(req.linz.record.toObject({ virtuals: true})),
        scripts: res.locals.scripts,
        styles: res.locals.styles,
        user: req.user,
    };

    if (Array.isArray(locals.overview.body)) {

        // Set tabId to each tab in locals.overview.body
        linz.formtools.overview.setTabId(locals.overview.body);

    }

    async.series([

        // check if doc can be edited
        function (cb) {

            // skip this if canEdit is not define for model
            if (!req.linz.record.canEdit) {
                return cb(null);
            }

            req.linz.record.canEdit(function (err, result, message) {

                if (err) {
                    return cb(err);
                }

                locals.record.edit = { disabled: !result, message: message };

                return cb(null);

            });

        },

        // check if doc can be deleted
        function (cb) {

            // skip this if canDelete is not define for model
            if (!req.linz.record.canDelete) {
                return cb(null);
            }

            req.linz.record.canDelete(function (err, result, message) {

                if (err) {
                    return cb(err);
                }

                locals.record.delete = { disabled: !result, message: message };

                return cb(null);

            });

        }

    ], function (err) {

        if (err) {
            return next(err);
        }

        const { actions, footerActions } = req.linz.model.linz.formtools.overview;
        const { parseModalProperties } = linz.api.formtools.actions;

        req.linz.model.linz.formtools.overview.actions = parseModalProperties(actions);
        req.linz.model.linz.formtools.overview.footerActions = parseModalProperties(footerActions);

        res.render(linz.api.views.viewPath('recordOverview.jade'), locals);

    });

};

module.exports = route;

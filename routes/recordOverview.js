
var linz = require('linz'),
    async = require('async'),
    clone = require('clone');


/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    var locals = {
        model: req.linz.model,
        record: clone(req.linz.record.toObject({ virtuals: true})),
        permissions: req.linz.model.linz.formtools.permissions,
        formtools: req.linz.model.linz.formtools,
        tabs: []
    };

    async.series([

        function (cb) {

            var details = req.linz.model.linz.formtools.overview.details;

            if (typeof details === 'function') {

                return req.linz.model.linz.formtools.overview.details(req, res, req.linz.record, req.linz.model, function (err, content) {

                    if (err) {
                        return cb(err);
                    }

                    locals.customOverview = content;
                    return cb();
                });
            }

            linz.formtools.overview.getOverviewFields(req.linz.model.schema, req.linz.model.linz.formtools.form, details, req.linz.record, req.linz.model, function (err, fields) {

                if (err) {
                    return cb(err);
                }

                locals.fields = fields;

                return cb();
            });

        },

        // process overview tabs
        function (cb) {

            if (!Array.isArray(req.linz.model.linz.formtools.overview.tabs) || !req.linz.model.linz.formtools.overview.tabs.length) {

                return cb();
            }

            async.eachSeries(req.linz.model.linz.formtools.overview.tabs, function (tab, callback) {

                if (typeof tab.body === 'function' ) {

                    return tab.body(req, res, req.linz.record, req.linz.model, function (err, content) {

                        if (err) {
                            return callback(err);
                        }

                        locals.tabs.push({
                            label: tab.label,
                            body: content
                        });

                        return callback();
                    });

                }

                if ( !Array.isArray(tab.fields) || !tab.fields.length ) {
                    return callback();
                }

                linz.formtools.overview.getOverviewFields(req.linz.model.schema, req.linz.model.linz.formtools.form, tab.fields, req.linz.record, req.linz.model, function (err, fields) {

                    if (err) {
                        return callback(err);
                    }

                    locals.tabs.push({
                        label: tab.label,
                        fields: fields
                    });

                    return callback();
                });

            }, cb);

        },

        // set body content to overviewBody
        function (cb) {

            if (!req.linz.model.linz.formtools.overview.body) {

                return cb(null);

            }

            req.linz.model.linz.formtools.overview.body(req, res, req.linz.record, req.linz.model, function (err, content) {

                if (err) {
                    return cb(err);
                }

                locals.overviewBody = content;

                return cb(null);

            });

        },

        function (cb) {

            if (!req.linz.model.versions) {
                return cb(null);
            }

            req.linz.model.versions.renderer(req, res, req.linz.record, req.linz.model, req.linz.model.versions, function (err, content) {

                if (err) {
                    return cb(err);
                }

                locals.overviewVersions = content;

                return cb(null);

            });

        },

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

        // define default overview action modal settings in a format that jade can access easily
        req.linz.model.linz.formtools.overview.actions.forEach(function (action) {

            var modal = { active: false };

            if (typeof action.modal === 'object') {
                modal = action.modal;
                modal.active = true;
            } else if (typeof action.modal === 'boolean') {
                modal.active = action.modal;
            }

            action.modal = modal;

        });

        res.render(linz.api.views.viewPath('recordOverview.jade'), locals);

    });

};

module.exports = route;

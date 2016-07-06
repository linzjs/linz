
var linz = require('linz'),
    async = require('async'),
    clone = require('clone');


/* GET /admin/:model/:id/overview */
var route = function (req, res, next) {

    function transformDslToOverview (dsl, cb) {

        if (!(Array.isArray(dsl) && dsl.length)) {
            return [];
        }

        var overviewBody = [];

        async.eachSeries(dsl, function (elm, callback) {

            if (typeof elm !== 'object') {
                return callback();
            }

            if (typeof elm.body === 'function') {

                return elm.body(req, res, req.linz.record, req.linz.model, function (err, content) {

                    if (err) {
                        return callback(err);
                    }

                    overviewBody.push({
                        label: elm.label,
                        body: content
                    });

                    return callback();

                });

            }

            // make recursive call, if elm or elm.body is an Array
            if (Array.isArray(elm) || Array.isArray(elm.body)) {

                var elmDsl = (Array.isArray(elm)) ? elm : elm.body;

                return transformDslToOverview(elmDsl, function (err, data) {

                    if (err) {
                        return cb(err);
                    }

                    if (Array.isArray(data) && data.length) {

                        var elmData = (Array.isArray(elm)) ? data : { label: elm.label, body: data };

                        overviewBody.push(elmData);
                    }

                    return callback();
                });

            }

            if (Array.isArray(elm.fields) && elm.fields.length) {

                return linz.formtools.overview.getOverviewFields(req.linz.model.linz.formtools.labels, req.linz.model.linz.formtools.form, elm.label, elm.fields, req.linz.record, req.linz.model, function (err, fieldset) {

                    if (err) {
                        return callback(err);
                    }

                    overviewBody.push(fieldset);

                    return callback();

                });

            }

            // return if elm does not meet any of the above conditions
            return callback();

        }, function (err) {
            return cb(err, overviewBody);
        });

    }

    var locals = {
            model: req.linz.model,
            record: clone(req.linz.record.toObject({ virtuals: true})),
            permissions: req.linz.model.linz.formtools.permissions,
            formtools: req.linz.model.linz.formtools
        };

    async.series([

        // set overviewBody
        function (cb) {

            // Transform overview.body DSL into data object that can be rendered by view
            transformDslToOverview(req.linz.model.linz.formtools.overview.body, function (err, overviewData) {

                if (err) {
                    return cb(err);
                }

                locals.overviewBody = overviewData;

                return cb();

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

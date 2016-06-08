
var linz = require('linz'),
    async = require('async'),
    clone = require('clone'),
    utils = require('../lib/utils');


var filterForm = function (form, formFields) {

    if (typeof form !== 'object' || utils.isEmptyObject(form)) {
        return {};
    }

    var filteredForm = {};

    if (!Array.isArray(formFields) || !formFields.length) {

        filteredForm = clone(form);
        return filteredForm;
    }

    formFields.forEach( function(field) {

        if (form[field]) {
            filteredForm[field] = form[field];
        }

    });

    return filteredForm;

};


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

            //render default overview if details is not provided or details provided is not a function OR not an Array containing fileds
            if ( !details || !(typeof details === 'function' || (Array.isArray(details) && details.length)) ) {

                var defaultOverview = ['dateCreated', 'dateModified'];
                var defaultForm = filterForm(req.linz.model.linz.formtools.form, defaultOverview);

                linz.formtools.renderOverview.generateViewFromModel(req.linz.model.schema, defaultForm, req.linz.record, req.linz.model, function (err, overView) {

                    if (err) {
                        return cb(err);
                    }

                    locals.fields = overView;
                    return cb(null);
                });

            }

            if (typeof details === 'function') {

                req.linz.model.linz.formtools.overview.details(req, res, req.linz.record, req.linz.model, function (err, content) {

                    if (err) {
                        return cb(err);
                    }

                    locals.customOverview = content;
                    return cb(null);
                });
            }

            if ( Array.isArray(details) && details.length ) {

                var form = filterForm(req.linz.model.linz.formtools.form, details);

                linz.formtools.renderOverview.generateViewFromModel(req.linz.model.schema, form, req.linz.record, req.linz.model, function (err, overView) {

                    if (err) {
                        return cb(err);
                    }

                    locals.fields = overView;
                    return cb(null);
                });
            }

        },

        // process tabs of overview detials
        function (cb) {

            if (!Array.isArray(req.linz.model.linz.formtools.overview.tabs) || !req.linz.model.linz.formtools.overview.tabs.length) {

                return cb(null);
            }

            async.eachSeries(req.linz.model.linz.formtools.overview.tabs, function (tab, callback) {

                if ( !tab.fields && !tab.body ) {
                    return callback(null);
                }

                // return if tab has fields but fileds is not an array or is an empty array
                if ( tab.fields && (!Array.isArray(tab.fields) || !tab.fields.length) ) {
                    return callback(null);
                }

                // return if tab has body but body is not a function
                if ( tab.body && (typeof tab.body !== 'function') ) {
                    return callback(null);
                }

                var tempTab = {
                    label: tab.label
                };

                if (tab.fields) {

                    var form = filterForm(req.linz.model.linz.formtools.form, tab.fields);

                    linz.formtools.renderOverview.generateViewFromModel(req.linz.model.schema, form, req.linz.record, req.linz.model, function (err, overView) {

                        if (err) {
                            return callback(err);
                        }

                        tempTab.fields = overView;
                        locals.tabs.push(tempTab);

                        return callback(null);
                    });

                }

                if (tab.body) {

                    tab.body(req, res, req.linz.record, req.linz.model, function (err, content) {

                        if (err) {
                            return callback(err);
                        }

                        tempTab.body = content;
                        locals.tabs.push(tempTab);

                        return callback(null);
                    });

                }

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

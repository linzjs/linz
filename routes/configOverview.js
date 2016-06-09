
var linz = require('../'),
    async = require('async'),
    pluginHelpers = require('../lib/formtools/plugins/plugins-helpers');


/* GET /admin/config/:config/overview */
var route = function (req, res) {

    var locals = {
        config: req.linz.config,
        record: req.linz.record,
        permissions: req.linz.config.linz.formtools.permissions,
        formtools: req.linz.config.linz.formtools
    };

    async.series([

        function (cb) {

            var details = req.linz.config.linz.formtools.overview.details;

            if (typeof details === 'function') {

                return req.linz.config.linz.formtools.overview.details(req, res, req.linz.record, req.linz.config, function (err, content) {

                    if (err) {
                        return cb(err);
                    }

                    locals.customOverview = content;
                    return cb();
                });
            }

            var overviewFields = pluginHelpers.getOverviewFields(req.linz.config.linz.formtools.form, details);
            linz.formtools.renderOverview.render(req.linz.config.schema, overviewFields, req.linz.record, req.linz.config, function (err, overview) {

                if (err) {
                    return cb(err);
                }

                locals.fields = overview;
                return cb();
            });

        },

        function (cb) {

            if (!req.linz.config.linz.formtools.overview.body) {

                return cb(null);

            }

            req.linz.config.linz.formtools.overview.body(req.linz.record, req.linz.config, function (err, content) {

                if (err) {
                    return cb(err);
                }

                locals.overviewBody = content;

                return cb(null);

            });

        }

    ], function (err, results) {

        res.render(linz.api.views.viewPath('configOverview.jade'), locals);

    });

};

module.exports = route;

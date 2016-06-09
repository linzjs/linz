
var linz = require('../'),
    async = require('async');


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

            linz.formtools.overview.getOverviewFields(req.linz.config.schema, req.linz.config.linz.formtools.form, details, req.linz.record, req.linz.config, function (err, fields) {

                if (err) {
                    return cb(err);
                }

                locals.fields = fields;
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

'use strict';

const clone = require('clone');
const linz = require('../');

/* GET /admin/config/:config/overview */
var route = function(req, res, next) {
    Promise.all([
        linz.api.views.getScripts(req, res),
        linz.api.views.getStyles(req, res),
    ])
        .then(([scripts, styles]) => {
            var locals = {
                config: req.linz.config,
                csrfToken: req.csrfToken(),
                formtools: req.linz.config.linz.formtools,
                overview: req.linz.overview,
                permissions: req.linz.config.linz.formtools.permissions,
                record: clone(req.linz.record),
                scripts,
                styles,
            };

            if (Array.isArray(locals.overview.body)) {
                // Set tabId to each tab in locals.overview.body
                linz.formtools.overview.setTabId(locals.overview.body);
            }

            return res.render(
                linz.api.views.viewPath('configOverview.jade'),
                locals
            );
        })
        .catch(next);
};

module.exports = route;

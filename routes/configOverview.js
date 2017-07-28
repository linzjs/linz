var linz = require('../'),
    clone = require('clone');

/* GET /admin/config/:config/overview */
var route = function (req, res) {

    var locals = {
        config: req.linz.config,
        formtools: req.linz.config.linz.formtools,
        overview: req.linz.overview,
        permissions: req.linz.config.linz.formtools.permissions,
        record: clone(req.linz.record),
        scripts: res.locals.scripts,
        styles: res.locals.styles,
    };

    if (Array.isArray(locals.overview.body)) {

        // Set tabId to each tab in locals.overview.body
        linz.formtools.overview.setTabId(locals.overview.body);

    }

    return res.render(linz.api.views.viewPath('configOverview.jade'), locals);

};

module.exports = route;

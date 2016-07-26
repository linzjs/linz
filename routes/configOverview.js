var linz = require('../');

/* GET /admin/config/:config/overview */
var route = function (req, res) {

    var locals = {
        config: req.linz.config,
        record: req.linz.record,
        permissions: req.linz.config.linz.formtools.permissions,
        formtools: req.linz.config.linz.formtools,
        overview: {}
    };

    // Transform overview.body DSL into data object that can be rendered by view
    linz.formtools.overview.body(req, res, req.linz.record, req.linz.config, function (err, body) {

        if (!err) {

            // body could be a string of HTML content OR an array of objects
            locals.overview.body = body;

        }

        res.render(linz.api.views.viewPath('configOverview.jade'), locals);

    });

};

module.exports = route;

var linz = require('../');

/* GET /admin/config/:config/default */
var route = function(req, res, next) {
    return res.redirect(
        linz.api.url.getAdminLink(
            req.linz.config,
            'overview',
            req.params.config
        )
    );
};

module.exports = route;

'use strict';

const linz = require('../');

/* GET /admin/merge-data-conflict-guide */
var route = function (req, res, next) {

    Promise.all([
        linz.api.views.getScripts(req, res),
        linz.api.views.getStyles(req, res),
    ])
        .then(([scripts, styles]) => {

            return res.render(linz.api.views.viewPath('merge-data-conflict-guide.jade'), {
                scripts,
                styles,
            });

        })
        .catch(next);

};

module.exports = route;

'use strict';

const linz = require('../');

/* GET /logs/request/list */
var route = function(req, res, next) {
    Promise.all([
        linz.api.views.getScripts(req, res),
        linz.api.views.getStyles(req, res),
    ])
        .then(([scripts, styles]) => {
            // update the requestLog data to work with HTML.
            const logs = req.linz.requestLog.replace(/\n/g, '<br />');

            return res.render(linz.api.views.viewPath('requestLog.jade'), {
                logs,
                scripts,
                styles,
            });
        })
        .catch(next);
};

module.exports = route;

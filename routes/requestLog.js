'use strict';

const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

/* GET /logs/request/list */
var route = function (req, res, next) {

    Promise.all([
        setTemplateScripts(req, res),
        setTemplateStyles(req, res),
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

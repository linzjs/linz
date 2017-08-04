'use strict';

const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

/* GET /admin/merge-data-conflict-guide */
var route = function (req, res, next) {

    Promise.all([
        setTemplateScripts(req, res),
        setTemplateStyles(req, res),
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

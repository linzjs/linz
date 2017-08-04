'use strict';

const linz = require('../');
const setTemplateScripts = require('../lib/scripts');
const setTemplateStyles = require('../lib/styles');

module.exports = {

    get: function (req, res, next) {

        Promise.all([
            setTemplateScripts(req, res),
            setTemplateStyles(req, res),
        ])
            .then(([scripts, styles]) => {

                return res.render(linz.api.views.viewPath('modelExport.jade'), {
                    model: req.linz.model,
                    modelExport: req.linz.export,
                    scripts,
                    styles,
                });

            })
            .catch(next);

    }

}

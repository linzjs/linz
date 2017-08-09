'use strict';

const linz = require('../');

module.exports = {

    get: function (req, res, next) {

        Promise.all([
            linz.api.views.getScripts(req, res, [
                {
                    src: `${linz.get('admin path')}/public/js/views/model-export.js`,
                },
            ]),
            linz.api.views.getStyles(req, res),
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

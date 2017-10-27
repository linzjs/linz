'use strict';

const linz = require('../');

module.exports = {

    get: function (req, res) {

        return res.render(linz.api.views.viewPath('modelExport.jade'), {
            model: req.linz.model,
            modelExport: req.linz.export,
        });

    }

}

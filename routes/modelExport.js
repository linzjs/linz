var linz = require('../');

module.exports = {

    get: function (req, res) {
        res.render(linz.api.views.viewPath('modelExport.jade'), {
            model: req.linz.model,
            modelExport: req.linz.export,
            scripts: res.locals.scripts,
            styles: res.locals.styles,
        });
    }

}

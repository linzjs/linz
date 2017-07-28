var linz = require('../');

module.exports = {

    get: function (req, res) {
        res.render(linz.api.views.viewPath('passwordReset.jade'), {
            record: req.linz.record,
            scripts: res.locals.scripts,
            styles: res.locals.styles,
        });
    },

    post: function (req, res) {
        res.render(linz.api.views.viewPath('passwordReset.jade'), {
            scripts: res.locals.scripts,
            styles: res.locals.styles,
            success: true,
        });
    }

}

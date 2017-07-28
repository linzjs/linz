var linz = require('../');

module.exports = {

    get: function (req, res) {
        res.render(linz.api.views.viewPath('forgottenPassword.jade'), {
            scripts: res.locals.scripts,
            styles: res.locals.styles,
        });
    },

    post: function (req, res) {
        res.render(linz.api.views.viewPath('forgottenPassword.jade'), {
            email: req.body.email,
            scripts: res.locals.scripts,
            styles: res.locals.styles,
            success: true,
        });
    }

}

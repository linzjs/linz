var linz = require('../');

module.exports = {

    get: function (req, res) {
        res.render(linz.api.views.viewPath('forgottenPassword.jade'));
    },

    post: function (req, res) {
        res.render(linz.api.views.viewPath('forgottenPassword.jade'), {
            success: true,
            email: req.body.email
        });
    }

}

var linz = require('../');

module.exports = {

    get: function (req, res) {
        res.render(linz.views + '/forgottenPassword.jade');
    },

    post: function (req, res) {
        res.render(linz.views + '/forgottenPassword.jade', {
            success: true,
            email: req.body.email
        });
    }

}

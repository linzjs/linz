var linz = require('../');

module.exports = {

    get: function (req, res) {
        res.render(linz.api.views.viewPath('passwordReset.jade'), { record: req.linz.record });
    },

    post: function (req, res) {
        res.render(linz.api.views.viewPath('passwordReset.jade'), {
            success: true
        });
    }

}

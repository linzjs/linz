var linz = require('../');

module.exports = {

    get: function (req, res) {
        res.render(linz.views + '/passwordReset.jade', { record: req.linz.record });
    },

    post: function (req, res) {
        res.render(linz.views + '/passwordReset.jade', {
            success: true
        });
    }

}

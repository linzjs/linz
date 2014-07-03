linz = require('../');

module.exports = function (err, req, res, next) {

    var error = {
        message: err.message,
        returnUrl: req.headers.referer
    }

    res.render(linz.views + '/error.jade', {
        error: error
    });

}

linz = require('../');

module.exports = function (err, req, res, next) {

    res.render(linz.views + '/error.jade', {
        error: err,
        returnUrl: req.headers.referer
    });

}

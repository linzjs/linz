var linz = require('../');

module.exports = function (err, req, res, next) {

    console.error(err.stack);

    res.render(linz.api.views.viewPath('error.jade'), {
        error: err,
        returnUrl: req.headers.referer
    });

}

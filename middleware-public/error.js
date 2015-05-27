module.exports = function (err, req, res, next) {

    // requires linz helpers to set req.linz.views
    require('../lib/helpers').linz()(req, res, function () {

        console.error(err.stack);

        res.render(req.linz.views + '/error.jade', {
            error: err,
            returnUrl: req.headers.referer
        });

    });

}

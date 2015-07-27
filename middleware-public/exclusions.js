var async = require('async');

module.exports = function () {

    if (!arguments.length) {
        throw new Error('Missing parameters! Please provide at least one middleware function.');
    }

    var args = Array.prototype.slice.call(arguments),
        exclusions = [/^\/admin\/(login|public)/],
        middlewares = args;

    if (Array.isArray(args[0]) && args.length === 1) {
        throw new Error('Please provide the middleware as the second parameter if the first is an exclusion Array.');
    }

    if (Array.isArray(args[0])) {
        exclusions = args[0];
        // remove the first arguments as this is an exclusion
        middlewares.splice(0,1);
    }

    return function (req, res, next) {

        // should we exclude this url?
        var exclude = exclusions.some(function (exclusion) {
            return exclusion.test(req.originalUrl);
        });

        // if so, skip the middlewares
        if (exclude) {
            return next(null);
        }

        async.eachSeries(middlewares, function (middleware, cb) {

            return middleware(req, res, cb);

        }, next);

    }

}

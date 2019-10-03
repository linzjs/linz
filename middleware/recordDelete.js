var linz = require('../');

module.exports = function() {
    return function(req, res, next) {
        req.linz.model.getObject(req.params.id, function(err, doc) {
            // Skip to a 404 page.
            if (err || !doc) {
                return next(err);
            }

            req.linz.record = doc;

            return next();
        });
    };
};

var linz = require('../');

module.exports = function (req, res, next) {

    linz.api.navigation.get(req.user, function (err, nav) {
        res.locals['linzNavigation'] = nav;
        return next();
    });

};

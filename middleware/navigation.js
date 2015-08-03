var linz = require('../');

module.exports = function (req, res, next) {

    linz.api.navigation.get(req, function (err, nav) {
        res.locals['linzNavigation'] = nav;
        return next();
    });

};

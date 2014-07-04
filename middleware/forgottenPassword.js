var linz = require('../');

module.exports = {
    get: function (req, res, next) {
        return next();
    },

    post: function (req, res, next) {

        if (!req.body.email) {
            return next(new Error('An email address is required in order to reset your password.'));
        }

        var User = linz.get('models')[linz.get('user model')];

        if (!User.resetPassword) {
            throw new Error('resetPassword() is not defined for user model.');
        }

        User.resetPassword(req.body.email, req, next);

    }
}

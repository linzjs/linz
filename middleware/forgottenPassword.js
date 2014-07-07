var linz = require('../');

module.exports = {

    post: function (req, res, next) {

        if (!req.body.email) {
            return next(new Error('An email address is required in order to reset your password.'));
        }

        var User = linz.get('models')[linz.get('user model')];

        if (!User.sendPasswordResetEmail) {
            throw new Error('sendPasswordResetEmail() is not defined for user model.');
        }

        User.sendPasswordResetEmail(req.body.email, req, next);

    }
}

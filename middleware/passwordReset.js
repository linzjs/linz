var linz = require('../');

module.exports = {
    get: async function(req, res, next) {
        req.linz.record = {};

        if (!req.params.id) {
            return next(new Error('User id is required.'));
        }

        const User = linz.api.model.get(linz.get('user model'));

        try {
            const doc = await User.findById(req.params.id).exec();

            if (!doc.verifyPasswordResetHash) {
                throw new Error(
                    'verifyPasswordResetHash() is not defined for user model document.'
                );
            }

            doc.verifyPasswordResetHash(req.params.hash, function(
                err,
                isMatch
            ) {
                if (err) {
                    return next(err);
                }

                if (!isMatch) {
                    return next(new Error('Invalid password reset.'));
                }

                req.linz.record = doc;

                return next();
            });
        } catch (err) {
            return next(err);
        }
    },

    post: function(req, res, next) {
        if (!req.body.password || !req.body.confirmPassword || !req.body.id) {
            return next(
                new Error(
                    'Unable to reset password. Required fields are missing.'
                )
            );
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(
                new Error(
                    'Unable to reset password. Password and confirm password must be the same.'
                )
            );
        }

        var User = linz.api.model.get(linz.get('user model'));

        if (!User.updatePassword) {
            throw new Error('updatePassword() is not defined for user model.');
        }

        // clear res.clearCookie('linzReturnUrl') so if use logs in after resetting password, it doesn't redirect back to the password reset page
        res.clearCookie('linzReturnUrl');

        User.updatePassword(req.body.id, req.body.password, req, res, next);
    },
};

'use strict';

const successful = ({ info, next, req, res, user }) => {
    // there is a user, let's log them in and then we want to offer (assuming there is no error):
    // 1. a specific redirect url
    // 2. the ability to call next
    // 3. default Linz operation, redirect to res.cookies.linzReturnUrl || /admin
    return req.login(user, (err) => {
        // The default Linz redirect.
        let defaultRedirect = linz.api.url.getLink();

        if (err) {
            return next(err);
        }

        // Does the user wan't to use req.flash to store a success message?
        if (opts.successFlash) {
            let flash = {};

            if (typeof opts.successFlash === 'string') {
                flash = { type: 'success', message: opts.successFlash };
            }

            flash.type = flash.type || 'success';
            flash.message = flash.message || info || 'Successful login';

            if (typeof flash.message === 'string') {
                req.flash(flash.type, flash.message);
            }
        }

        if (opts.successRedirect) {
            return res.redirect(opts.successRedirect);
        }

        if (opts.next) {
            return next();
        }

        // If we have a return url, let's use it and clear the cookie so we don't repeat
        // this unneccessarily.
        if (req.signedCookies.linzReturnUrl) {
            defaultRedirect = req.signedCookies.linzReturnUrl;
            res.clearCookie('linzReturnUrl');
        }

        return res.redirect(defaultRedirect);
    });
};

const failed = ({ err, info, next, req, res, user }) => {
    // if we have an error, call next
    if (err) {
        return next(err);
    }

    // if there is no user, we want to offer
    // 1. a specific redirect url
    // 2. the ability to call next
    // 3. default Linz operation, redirect to /admin/login
    if (!user) {
        // Does the user wan't to use req.flash to store an error message?
        if (opts.failureFlash) {
            let flash = {};

            if (typeof opts.failureFlash === 'string') {
                flash = { type: 'error', message: opts.failureFlash };
            }

            flash.type = flash.type || 'error';
            flash.message = flash.message || info || 'Unauthorised';

            if (typeof flash.message === 'string') {
                req.flash(flash.type, flash.message);
            }
        }

        if (opts.failureRedirect) {
            return res.redirect(opts.failureRedirect);
        }

        if (opts.next) {
            return next();
        }

        return res.redirect(linz.api.url.getLink('login'));
    }
};

module.exports = { failed, successful };

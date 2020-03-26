"use strict";

const linz = require("../../");

const successful = ({
    info,
    middlewareNext,
    next,
    req,
    res,
    successFlash,
    successRedirect,
    user
}) =>
    req.login(user, err => {
        // The default Linz redirect.
        let defaultRedirect = linz.api.url.getLink();

        if (err) {
            return middlewareNext(err);
        }

        // Does the user wan't to use req.flash to store a success message?
        if (successFlash) {
            let flash = {};

            if (typeof successFlash === "string") {
                flash = { type: "success", message: successFlash };
            }

            flash.type = flash.type || "success";
            flash.message = flash.message || info || "Successful login";

            if (typeof flash.message === "string") {
                req.flash(flash.type, flash.message);
            }
        }

        if (successRedirect) {
            return res.redirect(successRedirect);
        }

        if (next) {
            return middlewareNext();
        }

        // If we have a return url, let's use it and clear the cookie so we don't repeat
        // this unneccessarily.
        if (req.signedCookies.linzReturnUrl) {
            defaultRedirect = req.signedCookies.linzReturnUrl;
            res.clearCookie("linzReturnUrl");
        }

        return res.redirect(defaultRedirect);
    });

const failed = ({
    err,
    failureFlash,
    failureRedirect,
    info,
    middlewareNext,
    next,
    req,
    res,
    user
}) => {
    // if we have an error, call next
    if (err) {
        return middlewareNext(err);
    }

    // if there is no user, we want to offer
    // 1. a specific redirect url
    // 2. the ability to call next
    // 3. default Linz operation, redirect to /admin/login
    if (!user) {
        // Does the user wan't to use req.flash to store an error message?
        if (failureFlash) {
            let flash = {};

            if (typeof failureFlash === "string") {
                flash = { type: "error", message: failureFlash };
            }

            flash.type = flash.type || "error";
            flash.message = flash.message || info || "Unauthorised";

            if (typeof flash.message === "string") {
                req.flash(flash.type, flash.message);
            }
        }

        if (failureRedirect) {
            return res.redirect(failureRedirect);
        }

        if (next) {
            return middlewareNext();
        }

        return res.redirect(linz.api.url.getLink("login"));
    }
};

module.exports = { failed, successful };

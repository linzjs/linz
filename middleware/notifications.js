'use strict';

const linz = require('../');

module.exports = function (req, res, next) {

    req.linz.notifications = req.linz.notifications.concat(req.flash('linz-notification').map((note) => {

        return linz.api.views.notification(note)

    }));

    return next();

};

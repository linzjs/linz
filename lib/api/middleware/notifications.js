'use strict';

const linz = require('../../../');

module.exports = function (req, res, next) {

    const notifications = req.flash('linz-notification');

    req.linz.notifications = req.linz.notifications.concat(notifications.map((note) => {

        return linz.api.views.notification(note);

    }));

    return next();

};

"use strict";

var linz = require('../');

exports.getAdminLink = function (model, action, id) {

    var url = linz.get('admin path');

    // /admin
    if (arguments.length === 0) {
        return url;
    }

    // /admin/model/{model}/{id}/overview
    if (model !== undefined && action === undefined && id !== undefined) {
        return url += '/' + model + '/' + id + '/overview';
    }

    // /admin/model/{model}/{id}/{action}
    if (model !== undefined && action !== undefined && id !== undefined) {
        return url += '/' + model + '/' + id + '/' + action;
    }

    // /admin/model/{model}/list
    if (model !== undefined && action === undefined) {
        return url += '/model/' + model + '/list';
    }

    // /admin/model/{model}/{action}
    if (model !== undefined && action !== undefined) {
        return url += '/model/' + model + '/' + action;
    }

    // /admin/models/list (HERE)
    if (model === undefined && action === 'list') {
        return url += '/models/list';
    }

};

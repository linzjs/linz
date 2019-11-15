"use strict";

var linz = require('../../');

exports.getAdminLink = function (obj, action, id) {

    var url = linz.get('admin path'),
        modelPath = '/model/';

    // /admin
    if (arguments.length === 0) {
        return url;
    }

    if (obj) {

        if (obj && obj.config) {
            // /admin/config
            modelPath = '/config';
        } else {
            // /admin/model/{modelName}
            modelPath += obj.modelName;
        }

    }

    // /admin/model/{modelName}/{id}/overview OR /admin/config/{id}/overview
    if (obj !== undefined && action === undefined && id !== undefined) {
        return url +=  modelPath + '/' + id + '/overview';
    }

    // /admin/model/{modelName}/{id}/{action} OR /admin/config/{id}/{action}
    if (obj !== undefined && action !== undefined && id !== undefined) {
        return url +=  modelPath + '/' + id + '/' + action;
    }

    // /admin/model/{model}/list
    if (obj !== undefined && action === undefined) {
        return url += modelPath + '/list';
    }

    // /admin/configs/list
    if (obj !== undefined && obj.config && action === 'list') {
        return url += '/configs/list';
    }

    // /admin/model/{model}/{action}
    if (obj !== undefined && action !== undefined) {
        return url += modelPath + '/' + action;
    }

    // /admin/models/list (HERE)
    if (obj === undefined && action === 'list') {
        return url += '/models/list';
    }

};

exports.getLink = function () {

    var url = linz.get('admin path');

    // /admin
    if (arguments.length === 0) {
        return url;
    }

    for (var i = 0; i < arguments.length; i++) {

        url += (i < arguments.length) ? '/' : '';
        url += arguments[i];

    }

    return url;

};

exports.getAdminPasswordResetLink = function (id, hash) {

    let url = `${linz.get('admin path')}${linz.get('admin password reset path')}`;

    // If the id and hash are provided, automatically include them :)
    if (id && hash) {
        url += `/${encodeURIComponent(id)}/${encodeURIComponent(hash)}`;
    }

    return url;

}

exports.getAdminForgotPasswordLink = function () {
    return linz.get('admin forgot password path');
}
